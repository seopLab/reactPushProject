package com.cheongyak.ai;

// Gemini 에게 주는 지시문. 결과 모양은 Documents/ai/AI_결과항목_정의.md (v1.0) 를 따른다
final class NoticeAnalysisPrompt {

	private NoticeAnalysisPrompt() {
	}

	static final String SCHEMA_VERSION = "1.0";

	static final String TEXT = """
			너는 한국 아파트 청약 입주자모집공고문을 읽고 정보를 뽑는 도구다.
			첨부한 공고문만 근거로, 아래 JSON 하나만 출력한다. 설명 문장, 마크다운 금지.

			규칙
			1. 공고문에 없는 값은 null. 추측해서 채우지 않는다. 못 찾은 키는 "unknowns" 배열에 경로로 적는다.
			2. 날짜는 YYYY-MM-DD, 금액은 원 단위 정수, 비율은 숫자(%), 면적은 ㎡ 숫자.
			3. eligibility, specialSupplies 의 값마다 evidence 에 근거를 남긴다: field(키 경로), page(PDF 페이지 번호), quote(원문 문장 그대로, 요약 금지).
			4. 자격을 단정하는 해석을 덧붙이지 않는다. 공고문 문장을 구조화만 한다.

			출력 형식
			{
			  "notice": { "name": string, "supplyType": "민영|국민|공공분양|공공임대|신혼희망타운", "region": string, "address": string, "builder": string|null, "developer": string|null, "totalHouseholds": int|null, "moveInDate": "YYYY-MM"|null },
			  "schedule": { "noticeDate": date, "specialSupply": {"start": date, "end": date}|null, "firstRankLocal": {"start": date, "end": date}|null, "firstRankOther": {"start": date, "end": date}|null, "secondRank": {"start": date, "end": date}|null, "winnerDate": date|null, "contract": {"start": date, "end": date}|null },
			  "supply": [ { "houseType": string, "exclusiveArea": number|null, "generalCount": int|null, "specialCount": int|null, "maxPrice": int|null } ],
			  "eligibility": {
			    "residence": { "requiredRegion": string|null, "minMonths": int|null },
			    "homeless": { "required": bool|null, "scope": string|null },
			    "headOfHousehold": { "required": bool|null },
			    "account": { "minMonths": int|null, "minDepositByArea": object|null },
			    "age": { "min": int|null },
			    "income": { "limitPercent": number|null },
			    "asset": { "limitAmount": int|null },
			    "reWinRestriction": string|null
			  },
			  "specialSupplies": [ { "type": "신혼부부|생애최초|다자녀|노부모부양|기관추천|청년", "count": int|null, "conditions": [string], "incomeLimitPercent": number|null } ],
			  "documents": [string],
			  "evidence": [ { "field": string, "page": int|null, "quote": string } ],
			  "unknowns": [string]
			}
			""";

}
