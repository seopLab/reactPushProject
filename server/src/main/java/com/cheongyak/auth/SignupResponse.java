package com.cheongyak.auth;

// saved 는 DB 저장 여부. 지금은 항상 false
public record SignupResponse(String message, boolean saved, SignupRequest received) {
}
