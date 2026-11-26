package com.cheongyak.ai;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Base64;

import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

// 공고문 PDF → Gemini → 결과 JSON (WBS 5.16)
// 스프링 없이도 쓸 수 있게 순수 자바로 둔다. 나중에 서비스에서 이 클래스만 부르면 된다
public class NoticeAnalyzer implements NoticeAnalysisClient {

	private static final String ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent";

	private final String apiKey;
	private final String model;
	private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(20)).build();
	private final JsonMapper json = JsonMapper.builder().build();

	public NoticeAnalyzer(String apiKey, String model) {
		if (apiKey == null || apiKey.isBlank()) {
			throw new IllegalArgumentException("GEMINI_API_KEY 가 없습니다.");
		}
		this.apiKey = apiKey;
		this.model = model;
	}

	@Override
	public String model() {
		return model;
	}

	/** 공고문 PDF 를 분석해 결과 JSON(문자열)을 돌려준다. meta 는 이쪽에서 채운다 */
	@Override
	public String analyze(byte[] pdf, String sourcePdfUrl) throws IOException, InterruptedException {
		HttpRequest req = HttpRequest.newBuilder(URI.create(ENDPOINT.formatted(model)))
				.timeout(Duration.ofMinutes(3))
				.header("Content-Type", "application/json")
				.header("x-goog-api-key", apiKey)
				.POST(HttpRequest.BodyPublishers.ofString(requestBody(pdf)))
				.build();
		HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
		if (res.statusCode() != 200) {
			throw new IOException("Gemini 오류 " + res.statusCode() + ": " + res.body());
		}

		String text = json.readTree(res.body())
				.path("candidates").path(0).path("content").path("parts").path(0).path("text").asString();
		if (text == null || text.isBlank()) {
			throw new IOException("Gemini 응답에 결과가 없습니다: " + res.body());
		}

		ObjectNode result = (ObjectNode) json.readTree(stripFence(text));
		ObjectNode meta = json.createObjectNode();
		meta.put("schemaVersion", NoticeAnalysisPrompt.SCHEMA_VERSION);
		meta.put("sourcePdfUrl", sourcePdfUrl);
		meta.put("revision", 1);
		meta.put("model", model);
		meta.put("analyzedAt", OffsetDateTime.now().toString());
		ObjectNode ordered = json.createObjectNode();
		ordered.set("meta", meta);
		ordered.setAll(result);
		return json.writerWithDefaultPrettyPrinter().writeValueAsString(ordered);
	}

	private String requestBody(byte[] pdf) {
		ObjectNode body = json.createObjectNode();
		ArrayNode parts = body.putArray("contents").addObject().putArray("parts");
		ObjectNode file = parts.addObject().putObject("inline_data");
		file.put("mime_type", "application/pdf");
		file.put("data", Base64.getEncoder().encodeToString(pdf));
		parts.addObject().put("text", NoticeAnalysisPrompt.TEXT);
		ObjectNode config = body.putObject("generationConfig");
		config.put("responseMimeType", "application/json");
		config.put("temperature", 0);
		return json.writeValueAsString(body);
	}

	// 혹시 ```json ... ``` 으로 감싸서 오면 벗긴다
	private static String stripFence(String s) {
		String t = s.strip();
		if (t.startsWith("```")) {
			t = t.substring(t.indexOf('\n') + 1);
			int end = t.lastIndexOf("```");
			if (end >= 0) {
				t = t.substring(0, end);
			}
		}
		return t;
	}

}
