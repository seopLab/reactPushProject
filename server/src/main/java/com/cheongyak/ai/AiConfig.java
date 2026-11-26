package com.cheongyak.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

import com.cheongyak.common.BusinessException;

// Gemini 키가 없어도 서버는 켜진다. 분석을 요청했을 때만 "키가 없다"고 알려 준다
@Configuration
class AiConfig {

	@Bean
	NoticeAnalysisClient noticeAnalysisClient(
			@Value("${app.gemini.api-key:}") String apiKey,
			@Value("${app.gemini.model:${GEMINI_MODEL:gemini-2.5-flash}}") String model) {
		return create(apiKey, model);
	}

	static NoticeAnalysisClient create(String apiKey, String model) {
		if (apiKey == null || apiKey.isBlank()) {
			return new NoticeAnalysisClient() {
				@Override
				public String model() {
					return model;
				}

				@Override
				public String analyze(byte[] pdf, String sourcePdfUrl) {
					throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "AI 분석 키(GEMINI_API_KEY)가 설정되지 않았습니다.");
				}
			};
		}
		return new NoticeAnalyzer(apiKey, model);
	}

}
