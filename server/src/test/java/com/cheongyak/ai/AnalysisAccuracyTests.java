package com.cheongyak.ai;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.json.JsonMapper;

class AnalysisAccuracyTests {

	private final JsonMapper json = JsonMapper.builder().build();

	@Test
	void comparesPerFieldAndIgnoresFormattingDifferences() {
		var expected = json.readTree("""
				{"notice":{"name":"A","totalHouseholds":299,"developer":null},
				 "supply":[{"houseType":"84A","exclusiveArea":84.95}],
				 "eligibility":{"residence":{"minMonths":24}},
				 "meta":{"model":"채점 제외"}}""");
		var actual = json.readTree("""
				{"notice":{"name":" A ","totalHouseholds":299.0,"developer":null},
				 "supply":[{"houseType":"84B","exclusiveArea":84.95}],
				 "eligibility":{"residence":{"minMonths":12}},
				 "evidence":[{"field":"x","page":1,"quote":"채점 제외"}]}""");

		var report = AnalysisAccuracy.compare(expected, actual);

		assertThat(report.total()).isEqualTo(6);      // meta 는 세지 않는다
		assertThat(report.matched()).isEqualTo(4);    // 공백·299/299.0 은 같은 값으로 본다
		assertThat(report.mismatches()).extracting(AnalysisAccuracy.Mismatch::path)
				.containsExactly("supply[0].houseType", "eligibility.residence.minMonths");
		assertThat(report.rate()).isBetween(66.6, 66.7);
	}

	@Test
	void missingInActualCountsAsNull() {
		var expected = json.readTree("{\"a\":null,\"b\":\"x\"}");
		var actual = json.readTree("{}");

		var report = AnalysisAccuracy.compare(expected, actual);

		assertThat(report.matched()).isEqualTo(1);    // 정답 null = 결과에도 없어야 맞다
		assertThat(report.mismatches()).extracting(AnalysisAccuracy.Mismatch::path).containsExactly("b");
	}

}
