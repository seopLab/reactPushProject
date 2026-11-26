package com.cheongyak.ai;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import tools.jackson.databind.JsonNode;

// AI 분석 결과(actual)를 사람이 공고문을 읽고 만든 정답지(expected)와 항목별로 비교한다 (WBS 5.17)
// - 정답지에 있는 항목만 채점한다. 정답이 null 이면 "공고문에 없음" 이므로 결과도 null/없음이어야 맞다
// - 배열은 순서대로(인덱스) 비교한다
// - meta / evidence / unknowns 는 채점하지 않는다
public final class AnalysisAccuracy {

	private static final Set<String> SKIP = Set.of("meta", "evidence", "unknowns");

	private AnalysisAccuracy() {
	}

	public record Mismatch(String path, String expected, String actual) {
	}

	public record Report(int total, int matched, List<Mismatch> mismatches) {

		public double rate() {
			return total == 0 ? 0 : matched * 100.0 / total;
		}

	}

	public static Report compare(JsonNode expected, JsonNode actual) {
		Map<String, String> exp = new LinkedHashMap<>();
		Map<String, String> act = new LinkedHashMap<>();
		flatten("", expected, exp);
		flatten("", actual, act);

		int matched = 0;
		List<Mismatch> mismatches = new ArrayList<>();
		for (Map.Entry<String, String> e : exp.entrySet()) {
			String a = act.getOrDefault(e.getKey(), "null");
			if (e.getValue().equals(a)) {
				matched++;
			} else {
				mismatches.add(new Mismatch(e.getKey(), e.getValue(), a));
			}
		}
		return new Report(exp.size(), matched, mismatches);
	}

	private static void flatten(String path, JsonNode node, Map<String, String> out) {
		if (node == null || node.isNull() || node.isMissingNode()) {
			if (!path.isEmpty()) {
				out.put(path, "null");
			}
			return;
		}
		if (node.isObject()) {
			node.propertyNames().forEach(name -> {
				if (path.isEmpty() && SKIP.contains(name)) {
					return;
				}
				flatten(path.isEmpty() ? name : path + "." + name, node.get(name), out);
			});
		} else if (node.isArray()) {
			for (int i = 0; i < node.size(); i++) {
				flatten(path + "[" + i + "]", node.get(i), out);
			}
		} else {
			out.put(path, normalize(node));
		}
	}

	// 숫자는 값으로(84.0 == 84), 글자는 공백을 하나로 줄여서 비교
	private static String normalize(JsonNode leaf) {
		if (leaf.isNumber()) {
			return leaf.decimalValue().stripTrailingZeros().toPlainString();
		}
		String text = leaf.asString().strip().replaceAll("\\s+", " ");
		try {
			return new BigDecimal(text).stripTrailingZeros().toPlainString();
		} catch (NumberFormatException e) {
			return text;
		}
	}

}
