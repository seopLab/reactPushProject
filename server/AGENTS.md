# 서버 (Spring Boot) 작업 규칙

> 루트 `AGENTS.md` (Git·공통 규칙)와 함께 따른다. 실행·배포 방법은 `README.md`.

## 1. 기본

| 항목 | 내용 |
|---|---|
| 언어 / 프레임워크 | Java 17, Spring Boot 4.1 (Web MVC, Data JPA, Security, Validation, Flyway) |
| 빌드 / 테스트 | `./gradlew build` / `./gradlew test` (Mac 에서 permission denied 면 `sh ./gradlew ...`) |
| 프로필 | `local`(기본, H2 메모리) / `prod`(Supabase PostgreSQL — 팀 공용 DB 하나, `server/app.env` 필요) |
| 루트 패키지 | `com.cheongyak` |

## 2. 패키지 = 기능 = 담당

```
com.cheongyak/
├─ auth/          회원가입·로그인, JWT, SecurityConfig
├─ member/        회원 정보·청약 조건·탈퇴
├─ recommend/     맞춤 조회, 반경 계산
├─ favorite/      관심 청약
├─ housing/       공고 엔티티·조회
├─ collector/     수집 배치, @Scheduled, 주소→좌표
├─ notification/  푸시 토큰, 알림 발송, 조용한 시간
├─ ai/            공고 분석(Gemini), 자격 판정, AI 도우미
└─ common/        오류 응답, 예외 처리, CORS (공동 — 바꾸면 팀 공유)
```

새 기능은 해당 패키지 안에 이렇게 만든다 (하위 폴더 없이 평평하게, 파일이 많아지면 `dto/` 만 분리):

| 파일 | 역할 |
|---|---|
| `XxxController` | `@RestController`, 요청 검증(`@Valid`)·응답만. 로직 없음 |
| `XxxService` | 비즈니스 로직, `@Transactional` 은 여기에 |
| `XxxRepository` | `JpaRepository` |
| `Xxx` (엔티티) | 테이블과 1:1. 컬럼은 마이그레이션 SQL 과 정확히 일치 |
| `XxxRequest` / `XxxResponse` | `record` DTO. **엔티티를 API 응답으로 직접 내보내지 않는다** |

## 3. 규칙

1. **다른 패키지의 Repository·엔티티를 직접 쓰지 않는다.** 그 패키지의 Service 메서드를 부른다 (없으면 담당자에게 요청)
2. 의존성 주입은 **생성자 주입** (`private final` 필드 + 생성자). `@Autowired` 필드 주입 금지
3. URL 은 `/api/<기능>/...` (예: `POST /api/auth/signup`, `GET /api/housing/notices/{id}`), JSON 키는 camelCase
4. 성공 응답은 DTO 를 그대로 반환. 오류는 `throw new BusinessException(HttpStatus.XXX, "사용자에게 보일 한국어 문구")` → `{ "message": "..." }`
5. 입력 검증은 Request record 에 `@NotBlank`, `@Email` 등 + **한국어 message**. 컨트롤러 파라미터에 `@Valid`
6. 비밀번호는 `PasswordEncoder`(BCrypt) 로만 저장. 비밀번호·토큰을 로그에 찍지 않는다
7. 설정값은 `application.yml` 에 `${환경변수}` 로만. 실제 값은 `server/app.env` (Git 제외), 새 변수를 추가하면 `deploy/app.env.example` 에도 추가
8. 들여쓰기는 **탭**, import 는 와일드카드(`*`) 없이

## 4. DB · Flyway

- 테이블은 `src/main/resources/db/migration/V{번호}__{설명}.sql` 로만 만든다 (`ddl-auto: validate` — 엔티티와 테이블이 다르면 서버가 안 뜸)
- **새 번호를 쓰기 전에 Slack 에 번호를 먼저 말한다.** 같은 번호 두 개면 충돌
- `dev`/`main` 에 들어간 마이그레이션은 수정 금지 → 다음 번호로 새 파일
- Supabase DB 는 개발·운영 공용 하나다. 작업 중인 마이그레이션은 **로컬(H2)에서만** 돌리고, `dev` 에 병합된 뒤에 `prod` 프로필로 실행한다 (한번 적용되면 그 파일은 수정 불가)
- SQL 은 PostgreSQL 문법 기준, H2(`MODE=PostgreSQL`)에서도 돌아가게 쓴다
- 테이블·컬럼 이름은 snake_case 복수형 테이블 (`members`, `housing_notices`). ERD: 노션 「ERD (DB 설계)」 / FigJam
- 현재 스키마: `V1__init.sql` (테이블 13개). 다음 마이그레이션은 **`V2__...`**
- `db/vendor/postgresql/` 은 Supabase 에서만 도는 파일 (`V1_1__lock_supabase_data_api.sql` — 공개 키로 테이블 접근 차단). 팀 마이그레이션은 여기에 두지 않는다
- 새 테이블에서 긴 문자열은 `text` 대신 길이 없는 `varchar` (H2 에서 `text` 는 CLOB 이라 엔티티 검증 실패)

### 엔티티 타입 맞추기 (`ddl-auto: validate` — 다르면 서버가 안 뜸)

| DB 컬럼 | Java 타입 |
|---|---|
| `bigint generated ... identity` | `Long` + `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)` |
| `varchar(n)`, `varchar` | `String` |
| `numeric(p, s)` (lat, lng, area) | `BigDecimal` (`Double` 쓰면 검증 실패) |
| `int` | `Integer` (null 가능) / `int` |
| `boolean` | `Boolean` / `boolean` |
| `date` / `time` / `timestamp` | `LocalDate` / `LocalTime` / `LocalDateTime` |
| 복합 PK (`member_supply_types`, `favorites` 등) | `@IdClass` 또는 `@EmbeddedId` |

## 5. 테스트

- 커밋 전 `./gradlew test` 통과
- Service 로직은 단위 테스트, API 는 `@SpringBootTest` + MockMvc 로 정상·오류 케이스 하나씩 이상
- 테스트는 `local` 프로필(H2)로 돈다. Supabase DB 에 테스트 데이터를 넣지 않는다
