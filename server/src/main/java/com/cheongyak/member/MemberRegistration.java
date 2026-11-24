package com.cheongyak.member;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

// 다른 패키지(auth)가 회원을 만들 때 넘기는 값. 검증·정리는 넘기기 전에 끝낸다
// password 는 평문이고, MemberService 에서 해시로 바꾼 뒤 버린다
public record MemberRegistration(
		String loginId,
		String email,
		String password,
		String nickname,
		LocalDate birthDate,
		String regionName,
		Integer householdSize,
		String houseOwned,
		boolean hasBankAccount,
		Integer accountMonths,
		boolean locationAgreed,
		boolean notificationAgreed,
		Set<String> supplyTypes,
		Set<String> specialConditions,
		Map<String, Boolean> documents) {

	// 로그나 예외 메시지에 비밀번호가 찍히지 않게 한다
	@Override
	public String toString() {
		return "MemberRegistration[loginId=" + loginId + ", email=" + email + "]";
	}

}
