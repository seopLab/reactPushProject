package com.cheongyak.common;

// 앱이 받는 오류 응답의 공통 모양: { "message": "..." }
public record ErrorResponse(String message) {
}
