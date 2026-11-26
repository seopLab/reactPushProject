package com.cheongyak.ai;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cheongyak.common.BusinessException;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

// 공고 AI 분석: POST 로 분석(이미 했으면 저장된 결과), GET 으로 저장된 결과 조회
// TODO(A): JWT 가 붙으면 로그인한 사용자만 호출하게 막는다 (분석은 Gemini 비용이 든다)
@RestController
@RequestMapping("/api/ai/notices/{noticeId}/analysis")
public class NoticeAnalysisController {

	private static final JsonMapper JSON = JsonMapper.builder().build();

	private final NoticeAnalysisService service;

	public NoticeAnalysisController(NoticeAnalysisService service) {
		this.service = service;
	}

	@PostMapping
	public AnalysisResponse analyze(@PathVariable long noticeId) {
		return AnalysisResponse.from(service.analyze(noticeId));
	}

	@GetMapping
	public AnalysisResponse get(@PathVariable long noticeId) {
		return service.find(noticeId)
				.map(AnalysisResponse::from)
				.orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "아직 분석되지 않은 공고입니다."));
	}

	public record AnalysisResponse(Long noticeId, String status, String model, LocalDateTime analyzedAt, JsonNode result) {

		static AnalysisResponse from(NoticeAnalysis a) {
			JsonNode result = a.getResultJson() == null ? null : JSON.readTree(a.getResultJson());
			return new AnalysisResponse(a.getNoticeId(), a.getStatus(), a.getModel(), a.getAnalyzedAt(), result);
		}

	}

}
