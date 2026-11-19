# AI 결과 항목 정의 (공고문 분석 JSON 스키마) v1.0

WBS 3.12 · 담당 정민 · 2026-11-19

공고문 PDF 한 건을 Gemini 로 분석했을 때 돌려받는 JSON 의 모양. 서버는 이 JSON 을 `notice_analyses.result_json` 에 그대로 저장하고, 앱(공고 상세 · AI 도우미)과 자격 판정 로직이 이 값을 읽는다.

## 1. 원칙

1. **공고문에 없는 값은 `null`.** 추측해서 채우지 않는다. 확인 못 한 항목은 `unknowns` 에 이름을 남긴다
2. **자격 조건 값마다 근거를 남긴다.** `evidence` 에 페이지 번호와 원문 문장. 자격 판정 화면의 "근거 보기"가 이걸 쓴다
3. **형식 고정:** 날짜 `YYYY-MM-DD`, 금액 원 단위 정수, 비율은 숫자(%), 면적 ㎡ 숫자
4. **정정 공고:** 청약홈 파일명에 `(정정)` 이 붙으면 다시 분석하고 `meta.revision` 을 올린다 (실제로 `(2026.11.17.정정)` 공고 확인됨)

## 2. 전체 구조

```json
{
  "meta":        { "schemaVersion": "1.0", "sourcePdfUrl": "...", "revision": 1, "model": "gemini-...", "analyzedAt": "2026-11-19T10:00:00+09:00" },
  "notice":      { ... },
  "schedule":    { ... },
  "supply":      [ ... ],
  "eligibility": { ... },
  "specialSupplies": [ ... ],
  "documents":   [ ... ],
  "evidence":    [ ... ],
  "unknowns":    [ ... ]
}
```

## 3. 항목 상세

### notice — 공고 기본 정보
| 키 | 타입 | 예시 | 비고 |
|---|---|---|---|
| name | string | "해링턴 플레이스 문래" | 단지명 |
| supplyType | string | "민영" | 민영 / 국민 / 공공분양 / 공공임대 / 신혼희망타운 |
| region | string | "서울" | 시·도 |
| address | string | "서울특별시 영등포구 문래동..." | 공급 위치 (주소→좌표 변환에 사용) |
| builder | string | "..." | 시공사 |
| developer | string\|null | "..." | 시행사 |
| totalHouseholds | int\|null | 299 | 총 공급 세대수 |
| moveInDate | string\|null | "2029-05" | 입주 예정 (월까지만 나오면 YYYY-MM) |

### schedule — 청약 일정
| 키 | 타입 | 비고 |
|---|---|---|
| noticeDate | date | 모집공고일 (자격 판단 기준일) |
| specialSupply | {start, end} | 특별공급 접수 |
| firstRankLocal | {start, end} | 1순위 해당지역 |
| firstRankOther | {start, end}\|null | 1순위 기타지역 |
| secondRank | {start, end}\|null | 2순위 |
| winnerDate | date | 당첨자 발표 |
| contract | {start, end}\|null | 계약 기간 |

### supply[] — 주택형별 공급
| 키 | 타입 | 예시 |
|---|---|---|
| houseType | string | "084.9512A" 또는 "84A" |
| exclusiveArea | number | 84.95 |
| generalCount | int | 일반공급 세대수 |
| specialCount | int | 특별공급 세대수 |
| maxPrice | int\|null | 최고 분양가(원) |

### eligibility — 일반공급 자격 (자격 판정의 입력)
| 키 | 타입 | 설명 |
|---|---|---|
| residence.requiredRegion | string\|null | 해당지역 범위 (예: "서울특별시") |
| residence.minMonths | int\|null | 해당지역 최소 거주 기간(개월) |
| homeless.required | bool\|null | 무주택 요건 여부 |
| homeless.scope | string\|null | "세대주 및 세대원 전원" 등 |
| headOfHousehold.required | bool\|null | 세대주 요건 |
| account.minMonths | int\|null | 청약통장 최소 가입 기간 |
| account.minDepositByArea | object\|null | 예치금 기준 (면적·지역별) |
| age.min | int\|null | 최소 나이 |
| income.limitPercent | number\|null | 도시근로자 월평균소득 대비 % (공공분양 등) |
| asset.limitAmount | int\|null | 자산 기준(원) |
| reWinRestriction | string\|null | 재당첨 제한 문구 요약 |

### specialSupplies[] — 특별공급
| 키 | 타입 | 예시 |
|---|---|---|
| type | string | 신혼부부 / 생애최초 / 다자녀 / 노부모부양 / 기관추천 / 청년 |
| count | int\|null | 배정 세대수 |
| conditions | string[] | 핵심 조건 요약 (한 줄씩) |
| incomeLimitPercent | number\|null | 소득 기준 |

### documents[] — 제출 서류
`["주민등록등본", "가족관계증명서", ...]` (공고문 표기 그대로)

### evidence[] — 근거
| 키 | 타입 | 예시 |
|---|---|---|
| field | string | "eligibility.residence.minMonths" |
| page | int | 7 |
| quote | string | 공고문 원문 문장 (요약하지 않음) |

### unknowns[]
공고문에서 찾지 못한 키 목록. 예: `["eligibility.asset.limitAmount"]`

## 4. 예시 (축약)

```json
{
  "meta": { "schemaVersion": "1.0", "sourcePdfUrl": "https://static.applyhome.co.kr/ai/aia/getAtchmnfl.do?...", "revision": 1, "model": "gemini-...", "analyzedAt": "2026-11-19T10:00:00+09:00" },
  "notice": { "name": "해링턴 플레이스 문래", "supplyType": "민영", "region": "서울", "address": "서울특별시 영등포구 ...", "builder": "...", "developer": null, "totalHouseholds": null, "moveInDate": null },
  "schedule": { "noticeDate": "2026-11-13", "specialSupply": { "start": "2026-11-24", "end": "2026-11-24" }, "firstRankLocal": { "start": "2026-11-25", "end": "2026-11-25" }, "firstRankOther": null, "secondRank": null, "winnerDate": "2026-12-03", "contract": null },
  "supply": [ { "houseType": "84A", "exclusiveArea": 84.95, "generalCount": 40, "specialCount": 30, "maxPrice": null } ],
  "eligibility": { "residence": { "requiredRegion": "서울특별시", "minMonths": 24 }, "homeless": { "required": true, "scope": "세대주 및 세대원 전원" }, "account": { "minMonths": 24, "minDepositByArea": null } },
  "specialSupplies": [ { "type": "신혼부부", "count": 12, "conditions": ["혼인 7년 이내"], "incomeLimitPercent": 140 } ],
  "documents": ["주민등록등본", "가족관계증명서"],
  "evidence": [ { "field": "eligibility.residence.minMonths", "page": 7, "quote": "..." } ],
  "unknowns": ["eligibility.asset.limitAmount", "schedule.contract"]
}
```
※ 위 값은 형식 예시이며 실제 공고 값이 아니다.

## 5. 연결
- DB: `notice_analyses(notice_id, status, model, result_json, analyzed_at)` — ERD 초안과 동일
- 다음 작업: 5.16 공고문 분석기 (이 스키마를 Gemini 응답 형식으로 지정), 5.17 정확도 검증 (이 키 기준으로 정답지 작성)
