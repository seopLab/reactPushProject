package com.cheongyak.auth;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// 회원가입 폼 확인용. 화면: http://localhost:8080/signup.html
// 지금은 DB 없이 입력값 검사만 하고 받은 값을 그대로 돌려준다
// TODO(A): member 테이블이 생기면 저장 + JWT 발급으로 바꾼다
@RestController
@RequestMapping("/api/auth")
public class SignupController {

	@PostMapping("/signup")
	public SignupResponse signup(@Valid @RequestBody SignupRequest request) {
		return new SignupResponse("회원가입 입력값이 확인됐어요. (아직 저장하지 않아요)", false, request.normalized());
	}

}
