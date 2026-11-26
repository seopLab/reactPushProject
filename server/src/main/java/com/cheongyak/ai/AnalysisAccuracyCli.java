package com.cheongyak.ai;

import java.nio.file.Files;
import java.nio.file.Path;

import tools.jackson.databind.json.JsonMapper;

// 콘솔 실행용: gradlew checkAccuracy --args="<AI 결과.json> <정답지.json>"
public final class AnalysisAccuracyCli {

	private AnalysisAccuracyCli() {
	}

	public static void main(String[] args) throws Exception {
		if (args.length < 2) {
			System.err.println("사용법: gradlew checkAccuracy --args=\"<AI 결과.json> <정답지.json>\"");
			System.exit(1);
		}
		JsonMapper json = JsonMapper.builder().build();
		var actual = json.readTree(Files.readString(Path.of(args[0])));
		var expected = json.readTree(Files.readString(Path.of(args[1])));

		AnalysisAccuracy.Report report = AnalysisAccuracy.compare(expected, actual);
		for (AnalysisAccuracy.Mismatch m : report.mismatches()) {
			System.out.printf("✘ %-45s 정답=%s | AI=%s%n", m.path(), m.expected(), m.actual());
		}
		System.out.printf("%n일치 %d / %d 항목 (%.1f%%)%n", report.matched(), report.total(), report.rate());
	}

}
