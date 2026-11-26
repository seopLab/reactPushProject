package com.cheongyak.ai;

import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

// 공고 번호 → 모집공고문 PDF 주소.
// TODO(C): housing 패키지에 조회용 Service 가 생기면 그걸 부르도록 바꾼다 (지금은 housing 코드가 없어 테이블을 직접 읽는다)
@Component
public class NoticePdfProvider {

	private final JdbcClient jdbc;

	public NoticePdfProvider(JdbcClient jdbc) {
		this.jdbc = jdbc;
	}

	/** 공고가 없거나 PDF 주소가 비어 있으면 empty */
	public Optional<String> pdfUrl(long noticeId) {
		return jdbc.sql("select notice_pdf_url from housing_notices where id = :id")
				.param("id", noticeId)
				.query((rs, n) -> rs.getString(1))
				.list().stream()
				.findFirst()
				.filter(url -> !url.isBlank());
	}

}
