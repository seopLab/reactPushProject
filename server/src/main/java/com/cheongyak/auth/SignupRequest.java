package com.cheongyak.auth;

import java.time.LocalDate;
import java.util.Set;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

// 회원가입 폼(약관 동의 → 내 정보 → 청약 조건 → 서류 준비)에서 받는 값. Figma 02~04 기준
// TODO(A): 로그인 방식(이메일/소셜)이 정해지면 계정 정보 필드를 추가한다
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

		// 1/3 내 정보
		@NotBlank(message = "알림 기준 지역을 선택해 주세요.")
		@Size(max = 50, message = "지역 이름이 너무 길어요.")
		String region,
		@DecimalMin("-90") @DecimalMax("90")
		Double latitude,
		@DecimalMin("-180") @DecimalMax("180")
		Double longitude,
		@NotNull(message = "생년월일을 입력해 주세요.")
		@Past(message = "생년월일을 다시 확인해 주세요.")
		LocalDate birthDate,
		@NotNull(message = "가구원 수를 선택해 주세요.")
		@Min(value = 1, message = "가구원 수를 다시 확인해 주세요.")
		@Max(value = 4, message = "가구원 수를 다시 확인해 주세요.")
		Integer householdSize,   // 4 = 4명 이상
		@NotNull(message = "주택 보유 여부를 선택해 주세요.")
		HousingOwnership housingOwnership,

		// 2/3 청약 조건
		@NotEmpty(message = "관심 있는 공급 유형을 하나 이상 골라 주세요.")
		Set<SupplyType> supplyTypes,
		@NotNull(message = "청약통장 가입 여부를 선택해 주세요.")
		Boolean hasSubscriptionAccount,
		@Min(value = 0, message = "가입 기간을 다시 확인해 주세요.")
		@Max(value = 600, message = "가입 기간을 다시 확인해 주세요.")
		Integer subscriptionMonths,
		Set<ExtraCondition> extraConditions,

		// 3/3 서류 준비 (준비 상태만, 파일은 받지 않는다)
		Set<DocumentType> preparedDocuments) {

	public enum HousingOwnership { NONE, ONE, TWO_PLUS }

	public enum SupplyType { PRIVATE_SALE, PUBLIC_SALE, PUBLIC_RENTAL, NEWLYWED_HOPE_TOWN }

	public enum ExtraCondition { NEWLYWED, FIRST_HOME, MULTI_CHILD, ELDERLY_PARENT, YOUTH }

	public enum DocumentType { RESIDENT_REGISTRATION, FAMILY_RELATION, SUBSCRIPTION_ACCOUNT, INCOME_ASSET }

	// 통장이 없으면 가입 기간은 버리고, 선택 항목의 null 은 false / 빈 Set 으로 맞춘다
	public SignupRequest normalized() {
		return new SignupRequest(termsAgreed, privacyAgreed,
				Boolean.TRUE.equals(locationAgreed), Boolean.TRUE.equals(notificationAgreed),
				region.strip(), latitude, longitude, birthDate, householdSize, housingOwnership,
				supplyTypes, hasSubscriptionAccount,
				hasSubscriptionAccount ? subscriptionMonths : null,
				extraConditions == null ? Set.of() : extraConditions,
				preparedDocuments == null ? Set.of() : preparedDocuments);
	}

}
