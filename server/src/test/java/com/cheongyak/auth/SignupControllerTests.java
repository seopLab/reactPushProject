package com.cheongyak.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SignupControllerTests {

	private static final String VALID = """
			{
			  "termsAgreed": true, "privacyAgreed": true, "locationAgreed": false, "notificationAgreed": true,
			  "region": " 서울특별시 강남구 ", "birthDate": "1990-01-01",
			  "householdSize": 1, "housingOwnership": "NONE",
			  "supplyTypes": ["PRIVATE_SALE", "NEWLYWED_HOPE_TOWN"],
			  "hasSubscriptionAccount": false, "subscriptionMonths": 99,
			  "preparedDocuments": ["RESIDENT_REGISTRATION"]
			}
			""";

	@Autowired
	MockMvc mockMvc;

	@Test
	void 입력값이_올바르면_정리된_값을_돌려준다() throws Exception {
		mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(VALID))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.saved").value(false))
				.andExpect(jsonPath("$.received.region").value("서울특별시 강남구"))
				.andExpect(jsonPath("$.received.subscriptionMonths").doesNotExist())
				.andExpect(jsonPath("$.received.extraConditions").isEmpty());
	}

	@Test
	void 필수_약관에_동의하지_않으면_400() throws Exception {
		mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
						.content(VALID.replace("\"privacyAgreed\": true", "\"privacyAgreed\": false")))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("개인정보 수집·이용에 동의해야 가입할 수 있어요."));
	}

	@Test
	void 선택_동의_항목은_빠져도_false로_받는다() throws Exception {
		mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
						.content(VALID.replace("\"locationAgreed\": false, \"notificationAgreed\": true,", "")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.received.locationAgreed").value(false))
				.andExpect(jsonPath("$.received.notificationAgreed").value(false));
	}

	@Test
	void 필수_약관이_빠지면_400() throws Exception {
		mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
						.content(VALID.replace("\"termsAgreed\": true,", "")))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("서비스 이용약관에 동의해야 가입할 수 있어요."));
	}

	@Test
	void 공급_유형을_고르지_않으면_400() throws Exception {
		mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
						.content(VALID.replace("[\"PRIVATE_SALE\", \"NEWLYWED_HOPE_TOWN\"]", "[]")))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("관심 있는 공급 유형을 하나 이상 골라 주세요."));
	}

}
