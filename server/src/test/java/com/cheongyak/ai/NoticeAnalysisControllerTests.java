package com.cheongyak.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.cheongyak.common.BusinessException;

// 가짜 Gemini · 가짜 PDF 다운로더를 끼우고, 실제 DB(H2)에 저장되는지까지 본다
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class NoticeAnalysisControllerTests {

	private static final String PDF_URL = "https://example.com/a.pdf";

	@Autowired
	MockMvc mockMvc;

	@Autowired
	JdbcClient jdbc;

	@MockitoBean
	NoticeAnalysisClient client;

	@MockitoBean
	PdfFetcher pdfFetcher;

	long noticeId;

	@BeforeEach
	void setUp() throws Exception {
		jdbc.sql("insert into housing_notices (source, source_notice_no, name, notice_pdf_url) values ('APPLYHOME', 'T1', '테스트 공고', :url)")
				.param("url", PDF_URL).update();
		noticeId = jdbc.sql("select id from housing_notices where source_notice_no = 'T1'").query(Long.class).single();

		when(client.model()).thenReturn("test-model");
		when(pdfFetcher.fetch(PDF_URL)).thenReturn("%PDF-1.4".getBytes());
	}

	@Test
	void analyzeSavesResultAndSecondCallReusesIt() throws Exception {
		when(client.analyze(any(), any())).thenReturn("{\"notice\":{\"name\":\"테스트 공고\"}}");

		mockMvc.perform(post("/api/ai/notices/{id}/analysis", noticeId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("DONE"))
				.andExpect(jsonPath("$.model").value("test-model"))
				.andExpect(jsonPath("$.result.notice.name").value("테스트 공고"));

		// 이미 분석한 공고는 AI 를 다시 부르지 않는다 (비용)
		mockMvc.perform(post("/api/ai/notices/{id}/analysis", noticeId)).andExpect(status().isOk());
		verify(client, times(1)).analyze(any(), any());

		mockMvc.perform(get("/api/ai/notices/{id}/analysis", noticeId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.result.notice.name").value("테스트 공고"));
	}

	@Test
	void unknownNoticeIs404AndNotAnalyzedYetIs404() throws Exception {
		mockMvc.perform(post("/api/ai/notices/{id}/analysis", 999999))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("공고 또는 모집공고문 PDF 를 찾을 수 없습니다."));

		mockMvc.perform(get("/api/ai/notices/{id}/analysis", noticeId))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("아직 분석되지 않은 공고입니다."));
	}

	@Test
	void failureIsRecordedAndCanBeRetried() throws Exception {
		when(client.analyze(any(), any())).thenThrow(new IOException("Gemini 오류 500"));

		mockMvc.perform(post("/api/ai/notices/{id}/analysis", noticeId))
				.andExpect(status().isBadGateway())
				.andExpect(jsonPath("$.message").value("공고문 분석에 실패했습니다."));
		mockMvc.perform(get("/api/ai/notices/{id}/analysis", noticeId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("FAILED"))
				.andExpect(jsonPath("$.result").doesNotExist());

		// FAILED 는 다시 시도할 수 있다
		doReturn("{\"notice\":{\"name\":\"다시\"}}").when(client).analyze(any(), any());
		mockMvc.perform(post("/api/ai/notices/{id}/analysis", noticeId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("DONE"))
				.andExpect(jsonPath("$.result.notice.name").value("다시"));
	}

	@Test
	void missingApiKeyGivesClearError() {
		NoticeAnalysisClient noKey = AiConfig.create("", "m");
		assertThatThrownBy(() -> noKey.analyze(new byte[0], null))
				.isInstanceOf(BusinessException.class)
				.hasMessageContaining("GEMINI_API_KEY");
		assertThat(noKey.model()).isEqualTo("m");
	}

}
