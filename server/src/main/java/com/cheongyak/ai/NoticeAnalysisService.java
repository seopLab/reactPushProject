package com.cheongyak.ai;

import java.io.IOException;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.cheongyak.common.BusinessException;

// 공고 한 건 분석: PDF 내려받기 → Gemini → 결과 저장.
// 이미 DONE 이면 다시 부르지 않는다 (공고당 AI 호출 1회 — 비용 정책).
// Gemini 호출이 길 수 있어 DB 트랜잭션은 잡지 않는다 (저장은 repository 가 각각 처리)
@Service
public class NoticeAnalysisService {

	private final NoticeAnalysisRepository repository;
	private final NoticePdfProvider pdfProvider;
	private final PdfFetcher pdfFetcher;
	private final NoticeAnalysisClient client;

	public NoticeAnalysisService(NoticeAnalysisRepository repository, NoticePdfProvider pdfProvider,
			PdfFetcher pdfFetcher, NoticeAnalysisClient client) {
		this.repository = repository;
		this.pdfProvider = pdfProvider;
		this.pdfFetcher = pdfFetcher;
		this.client = client;
	}

	public Optional<NoticeAnalysis> find(long noticeId) {
		return repository.findByNoticeId(noticeId);
	}

	public NoticeAnalysis analyze(long noticeId) {
		Optional<NoticeAnalysis> existing = repository.findByNoticeId(noticeId);
		if (existing.isPresent() && NoticeAnalysis.DONE.equals(existing.get().getStatus())) {
			return existing.get();
		}

		String pdfUrl = pdfProvider.pdfUrl(noticeId)
				.orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "공고 또는 모집공고문 PDF 를 찾을 수 없습니다."));
		NoticeAnalysis row = existing.orElseGet(() -> new NoticeAnalysis(noticeId));

		try {
			byte[] pdf = pdfFetcher.fetch(pdfUrl);
			row.markDone(client.model(), client.analyze(pdf, pdfUrl));
		} catch (BusinessException e) {
			throw e;   // 키 없음 등: 기록을 남기지 않고 그대로 알린다
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new BusinessException(HttpStatus.BAD_GATEWAY, "공고문 분석이 중단되었습니다.");
		} catch (IOException | RuntimeException e) {
			row.markFailed(client.model());
			repository.save(row);
			throw new BusinessException(HttpStatus.BAD_GATEWAY, "공고문 분석에 실패했습니다.");
		}
		return repository.save(row);
	}

}
