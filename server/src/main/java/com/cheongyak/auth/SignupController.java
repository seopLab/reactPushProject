package com.cheongyak.auth;

import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cheongyak.auth.SignupRequest.DocumentType;
import com.cheongyak.member.MemberRegistration;
import com.cheongyak.member.MemberService;

// TODO(A): 로그인 API 를 만들 때 가입 직후 JWT 도 함께 발급한다
@RestController
@RequestMapping("/api/auth")
public class SignupController {

	private final MemberService memberService;

	public SignupController(MemberService memberService) {
		this.memberService = memberService;
	}

	@PostMapping("/signup")
	public SignupResponse signup(@Valid @RequestBody SignupRequest request) {
		SignupRequest normalized = request.normalized();
		Long memberId = memberService.register(toRegistration(normalized));
		return new SignupResponse("회원가입이 완료됐어요.", true, memberId, normalized);
	}

	private static MemberRegistration toRegistration(SignupRequest r) {
		// 서류는 4종을 모두 저장하고 준비한 것만 checked = true (마이페이지에서 체크리스트로 보여 주기 위함)
		Map<String, Boolean> documents = Arrays.stream(DocumentType.values())
				.collect(Collectors.toMap(Enum::name, type -> r.preparedDocuments().contains(type)));
		return new MemberRegistration(
				r.loginId(), r.email(), r.password(), r.nickname(),
				r.birthDate(), r.region(), r.householdSize(), r.housingOwnership().name(),
				r.hasSubscriptionAccount(), r.subscriptionMonths(),
				r.locationAgreed(), r.notificationAgreed(),
				names(r.supplyTypes()), names(r.extraConditions()), documents);
	}

	private static Set<String> names(Set<? extends Enum<?>> values) {
		return values.stream().map(Enum::name).collect(Collectors.toSet());
	}

}
