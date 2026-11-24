package com.cheongyak.auth;

// received 의 password 는 SignupRequest 에서 WRITE_ONLY 라 JSON 에 나가지 않는다
public record SignupResponse(String message, boolean saved, Long memberId, SignupRequest received) {
}
