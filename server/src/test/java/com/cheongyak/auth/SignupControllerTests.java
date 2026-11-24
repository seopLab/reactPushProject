package com.cheongyak.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import com.cheongyak.member.Member;
import com.cheongyak.member.MemberRepository;

// H2(local)에서 돈다. 테스트마다 롤백되므로 같은 아이디를 여러 테스트에서 써도 된다
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SignupControllerTests {

	private static final String VALID = """
			{
			  "termsAgreed": true, "privacyAgreed": true, "locationAgreed": false, "notificationAgreed": true,
			  "loginId": "cheongyak_kim", "email": "Kim@Example.com", "password": "abcd1234", "nickname": " 청약왕 ",
			  "region": " 서울특별시 강남구 ", "birthDate": "1990-01-01",
			  "householdSize": 1, "housingOwnership": "NONE",
			  "supplyTypes": ["PRIVATE_SALE", "NEWLYWED_HOPE_TOWN"],
			  "hasSubscriptionAccount": false, "subscriptionMonths": 99,
			  "preparedDocuments": ["RESIDENT_REGISTRATION"]
			}
			""";

	@Autowired
	MockMvc mockMvc;

	@Autowired
	MemberRepository memberRepository;

	@Autowired
	PasswordEncoder passwordEncoder;

	private ResultActions signup(String body) throws Exception {
		return mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body));
	}

	@Test
	void 가입하면_DB에_저장하고_정리된_값을_돌려준다() throws Exception {
		signup(VALID)
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.saved").value(true))
				.andExpect(jsonPath("$.memberId").isNumber())
				.andExpect(jsonPath("$.received.email").value("kim@example.com"))
				.andExpect(jsonPath("$.received.region").value("서울특별시 강남구"))
				.andExpect(jsonPath("$.received.subscriptionMonths").doesNotExist())
				.andExpect(jsonPath("$.received.extraConditions").isEmpty())
				.andExpect(jsonPath("$.received.password").doesNotExist());

		Member member = memberRepository.findByLoginId("cheongyak_kim").orElseThrow();
		assertThat(member.getEmail()).isEqualTo("kim@example.com");
		assertThat(member.getNickname()).isEqualTo("청약왕");
		assertThat(member.getTermsAgreedAt()).isNotNull();
		assertThat(member.getSupplyTypes()).isEqualTo(Set.of("PRIVATE_SALE", "NEWLYWED_HOPE_TOWN"));
		assertThat(member.getSpecialConditions()).isEmpty();
		assertThat(member.getDocuments()).isEqualTo(Map.of(
				"RESIDENT_REGISTRATION", true, "FAMILY_RELATION", false,
				"SUBSCRIPTION_ACCOUNT", false, "INCOME_ASSET", false));
	}

	@Test
	void 비밀번호는_BCrypt_해시로만_저장한다() throws Exception {
		signup(VALID).andExpect(status().isOk());

		String hash = memberRepository.findByLoginId("cheongyak_kim").orElseThrow().getPasswordHash();
		assertThat(hash).isNotEqualTo("abcd1234").startsWith("$2");
		assertThat(passwordEncoder.matches("abcd1234", hash)).isTrue();
	}

	@Test
	void 같은_아이디로_다시_가입하면_409() throws Exception {
		signup(VALID).andExpect(status().isOk());

		signup(VALID.replace("Kim@Example.com", "other@example.com"))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("이미 사용 중인 아이디예요."));
	}

	@Test
	void 대소문자만_다른_이메일로_다시_가입하면_409() throws Exception {
		signup(VALID).andExpect(status().isOk());

		signup(VALID.replace("cheongyak_kim", "cheongyak_lee").replace("Kim@Example.com", "KIM@example.COM"))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("이미 가입된 이메일이에요."));
	}

	@Test
	void 비밀번호에_숫자가_없으면_400() throws Exception {
		signup(VALID.replace("abcd1234", "abcdefgh"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("비밀번호는 영문과 숫자를 섞어 8~20자로 입력해 주세요."));
	}

	@Test
	void 아이디에_대문자가_있으면_400() throws Exception {
		signup(VALID.replace("cheongyak_kim", "Cheongyak"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("아이디는 영문 소문자·숫자·_ 로 4~20자 입력해 주세요."));
	}

	@Test
	void 필수_약관에_동의하지_않으면_400() throws Exception {
		signup(VALID.replace("\"privacyAgreed\": true", "\"privacyAgreed\": false"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("개인정보 수집·이용에 동의해야 가입할 수 있어요."));
	}

	@Test
	void 선택_동의_항목은_빠져도_false로_받는다() throws Exception {
		signup(VALID.replace("\"locationAgreed\": false, \"notificationAgreed\": true,", ""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.received.locationAgreed").value(false))
				.andExpect(jsonPath("$.received.notificationAgreed").value(false));
	}

	@Test
	void 필수_약관이_빠지면_400() throws Exception {
		signup(VALID.replace("\"termsAgreed\": true,", ""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("서비스 이용약관에 동의해야 가입할 수 있어요."));
	}

	@Test
	void 공급_유형을_고르지_않으면_400() throws Exception {
		signup(VALID.replace("[\"PRIVATE_SALE\", \"NEWLYWED_HOPE_TOWN\"]", "[]"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("관심 있는 공급 유형을 하나 이상 골라 주세요."));
	}

}
