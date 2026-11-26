package com.cheongyak.ai;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.stereotype.Component;

// 공고문 PDF 를 주소에서 내려받는다 (PDF 가 아니면 실패)
@Component
public class PdfFetcher {

	private final HttpClient http = HttpClient.newBuilder()
			.followRedirects(HttpClient.Redirect.NORMAL)
			.connectTimeout(Duration.ofSeconds(20))
			.build();

	public byte[] fetch(String url) throws IOException, InterruptedException {
		HttpRequest req = HttpRequest.newBuilder(URI.create(url))
				.timeout(Duration.ofSeconds(60))
				.header("User-Agent", "Mozilla/5.0")
				.build();
		HttpResponse<byte[]> res = http.send(req, HttpResponse.BodyHandlers.ofByteArray());
		if (res.statusCode() != 200) {
			throw new IOException("PDF 다운로드 실패 " + res.statusCode());
		}
		byte[] body = res.body();
		if (body.length < 5 || !new String(body, 0, 5, StandardCharsets.US_ASCII).startsWith("%PDF")) {
			throw new IOException("PDF 파일이 아닙니다.");
		}
		return body;
	}

}
