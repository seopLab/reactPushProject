package com.cheongyak.common;

import org.springframework.http.HttpStatus;

// 각 기능에서 "이 상황엔 이 상태코드 + 이 문구" 로 던지는 예외
public class BusinessException extends RuntimeException {

	private final HttpStatus status;

	public BusinessException(HttpStatus status, String message) {
		super(message);
		this.status = status;
	}

	public HttpStatus getStatus() {
		return status;
	}

}
