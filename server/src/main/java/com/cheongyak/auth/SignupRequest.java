package com.cheongyak.auth;

import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// 회원가입 폼(약관 동의 → 계정 정보 → 내 정보 → 청약 조건 → 서류 준비)에서 받는 값. Figma 02~04 기준
// 입력 규칙은 앱 src/screens/signup/signupValidation.ts 와 같게 유지한다
public record SignupRequest(
		// 약관 동의. Jackson 3 는 빠진 boolean 을 오류로 보므로 Boolean 으로 받는다
		@NotNull(message = "서비스 이용약관에 동의해야 가입할 수 있어요.")
		@AssertTrue(message = "서비스 이용약관에 동의해야 가입할 수 있어요.")
		Boolean termsAgreed,
		@NotNull(message = "개인정보 수집·이용에 동의해야 가입할 수 있어요.")
		@AssertTrue(message = "개인정보 수집·이용에 동의해야 가입할 수 있어요.")
		Boolean privacyAgreed,
		Boolean locationAgreed,
		Boolean notificationAgreed,

		// 1/4 계정 정보
		@NotBlank(message = "아이디를 입력해 주세요.")
		@Pattern(regexp = "^[a-z0-9_]{4,20}$", message = "아이디는 영문 소문자·숫자·_ 로 4~20자 입력해 주세요.")
		String loginId,
		@NotBlank(message = "이메일을 입력해 주세요.")
		@Email(message = "이메일 형식을 확인해 주세요.")
		@Size(max = 255, message = "이메일이 너무 길어요.")
		String email,
		// 받기만 하고 응답 JSON 에는 담지 않는다
		@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
		@NotBlank(message = "비밀번호를 입력해 주세요.")
		@Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)\\S{8,20}$", message = "비밀번호는 영문과 숫자를 섞어 8~20자로 입력해 주세요.")
		String password,
		@NotBlank(message = "닉네임을 입력해 주세요.")
		@Size(min = 2, max = 20, message = "닉네임은 2~20자로 입력해 주세요.")
		String nickname,

		// 2/4 내 정보
		@NotBlank(message = "알림 기준 지역을 선택해 주세요.")
		@Size(max = 50, message = "지역 이름이 너무 길어요.")
		String region,
		@NotNull(message = "생년월일을 입력해 주세요.")
		@Past(message = "생년월일을 다시 확인해 주세요.")
		LocalDate birthDate,
		@NotNull(message = "가구원 수를 선택해 주세요.")
		@Min(value = 1, message = "가구원 수를 다시 확인해 주세요.")
		@Max(value = 4, message = "가구원 수를 다시 확인해 주세요.")
		Integer householdSize,   // 4 = 4명 이상
		@NotNull(message = "주택 보유 여부를 선택해 주세요.")
		HousingOwnership housingOwnership,

		// 3/4 청약 조건
		@NotEmpty(message = "관심 있는 공급 유형을 하나 이상 골라 주세요.")
		Set<SupplyType> supplyTypes,
		@NotNull(message = "청약통장 가입 여부를 선택해 주세요.")
		Boolean hasSubscriptionAccount,
		@Min(value = 0, message = "가입 기간을 다시 확인해 주세요.")
		@Max(value = 600, message = "가입 기간을 다시 확인해 주세요.")
		Integer subscriptionMonths,
		Set<ExtraCondition> extraConditions,

		// 4/4 서류 준비 (준비 상태만, 파일은 받지 않는다)
		Set<DocumentType> preparedDocuments) {

	public enum HousingOwnership { NONE, ONE, TWO_PLUS }

	public enum SupplyType { PRIVATE_SALE, PUBLIC_SALE, PUBLIC_RENTAL, NEWLYWED_HOPE_TOWN }

	public enum ExtraCondition { NEWLYWED, FIRST_HOME, MULTI_CHILD, ELDERLY_PARENT, YOUTH }

	public enum DocumentType { RESIDENT_REGISTRATION, FAMILY_RELATION, SUBSCRIPTION_ACCOUNT, INCOME_ASSET }

	// 기본 record toString 은 비밀번호까지 찍으므로 덮어쓴다
	@Override
	public String toString() {
		return "SignupRequest[loginId=" + loginId + ", email=" + email + "]";
	}

	// 통장이 없으면 가입 기간은 버리고, 선택 항목의 null 은 false / 빈 Set 으로 맞춘다
	// 이메일은 대소문자만 다른 중복 가입을 막으려고 소문자로 맞춘다
	public SignupRequest normalized() {
		return new SignupRequest(termsAgreed, privacyAgreed,
				Boolean.TRUE.equals(locationAgreed), Boolean.TRUE.equals(notificationAgreed),
				loginId, email.strip().toLowerCase(Locale.ROOT), password, nickname.strip(),
				region.strip(), birthDate, householdSize, housingOwnership,
				supplyTypes, hasSubscriptionAccount,
				hasSubscriptionAccount ? subscriptionMonths : null,
				extraConditions == null ? Set.of() : extraConditions,
				preparedDocuments == null ? Set.of() : preparedDocuments);
	}

}
