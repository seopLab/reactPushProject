package com.cheongyak.ai;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

// 콘솔 실행용: gradlew analyzeNotice --args="<공고문 PDF URL 또는 파일 경로> [결과 저장 경로]"
// 필요: 환경 변수 GEMINI_API_KEY (선택: GEMINI_MODEL)
public final class NoticeAnalyzerCli {

	private NoticeAnalyzerCli() {
	}

	public static void main(String[] args) throws Exception {
		if (args.length < 1) {
			System.err.println("사용법: gradlew analyzeNotice --args=\"<공고문 PDF URL 또는 파일 경로> [결과 저장 경로]\"");
			System.exit(1);
		}
		String source = args[0];
		Path out = Path.of(args.length > 1 ? args[1] : "build/analysis/result.json");

		boolean remote = source.startsWith("http");
		byte[] pdf = remote ? new PdfFetcher().fetch(source) : Files.readAllBytes(Path.of(source));
		System.out.printf("공고문 PDF %,d bytes 읽음%n", pdf.length);

		String apiKey = System.getenv("GEMINI_API_KEY");
		if (apiKey == null || apiKey.isBlank()) {
			System.err.println("GEMINI_API_KEY 환경 변수가 없습니다. 키를 넣고 다시 실행하세요.");
			System.exit(2);
		}
		String model = System.getenv().getOrDefault("GEMINI_MODEL", "gemini-2.5-flash");

		System.out.println("Gemini(" + model + ") 분석 중...");
		long t = System.currentTimeMillis();
		String result = new NoticeAnalyzer(apiKey, model).analyze(pdf, remote ? source : null);
		Files.createDirectories(out.toAbsolutePath().getParent());
		Files.writeString(out, result, StandardCharsets.UTF_8);
		System.out.println(result);
		System.out.printf("%n완료 %.1f초 → %s%n", (System.currentTimeMillis() - t) / 1000.0, out.toAbsolutePath());
	}

}
