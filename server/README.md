# 청약소식 서버 (Spring Boot)

| 항목 | 내용 |
|---|---|
| 언어 / 버전 | Java 17, Spring Boot 4.1.2 |
| 빌드 | Gradle (`gradlew` 사용, 따로 설치 불필요) |
| DB | `local` = H2 메모리 DB (설치 불필요) / `prod` = PostgreSQL (Supabase) |
| 테이블 | Flyway (`src/main/resources/db/migration`) |

## 패키지와 담당

```
src/main/java/com/cheongyak/
├─ auth/          A     회원가입·로그인, JWT, SecurityConfig
├─ member/        A     회원 정보·청약 조건
├─ recommend/     B     맞춤 조회, 반경 계산 (housing 은 조회용 Service 로만)
├─ favorite/      B     관심 청약 저장·해제
├─ housing/       C     공고 엔티티·조회
├─ collector/     C     수집 배치 + @Scheduled + 중복 처리 + 주소→좌표
├─ notification/  미정  푸시 토큰, 알림 발송, 조용한 시간
├─ ai/            정민  공고 분석(Gemini), 자격 판정, AI 도우미
└─ common/        공동  오류 응답, 예외 처리, CORS
```

각 패키지의 `package-info.java` 에 역할이 적혀 있다.

## 규칙

1. **다른 사람 패키지의 Repository 를 직접 쓰지 않는다.** 필요한 건 그 패키지의 Service 를 부른다
2. **테이블은 Flyway 로만 만든다.** 이미 main 에 합쳐진 마이그레이션 파일은 수정 금지, 다음 번호로 새 파일 (`db/migration/README.md`)
3. **비밀번호·API 키는 코드와 `application.yml` 에 쓰지 않는다.** 전부 환경 변수 (`deploy/app.env.example`)
4. 오류는 `BusinessException(상태코드, "문구")` 로 던지면 `{ "message": "..." }` 로 응답된다
5. `common/` 을 바꿀 때는 팀에 먼저 공유

## 실행

```powershell
cd server
.\gradlew.bat bootRun          # Mac/Linux: ./gradlew bootRun
```

- 상태 확인: http://localhost:8080/actuator/health
- DB 보기: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:cheongyak`, 사용자 `sa`)

## 실행 파일 만들기

```powershell
.\gradlew.bat build            # 테스트 + 빌드 → build\libs\server.jar
java -jar build\libs\server.jar
```

## 배포 (AWS EC2)

`deploy/` 폴더

| 파일 | 용도 |
|---|---|
| `cheongyak-server.service` | 서버를 systemd 서비스로 등록 |
| `app.env.example` | 서버 환경 변수 틀 (`/opt/cheongyak-server/app.env`) |
| `buildspec.yml` | CodeBuild 빌드 설정 **(초안, 미검증)** |
| `appspec.yml` + `scripts/` | CodeDeploy 배포 설정 **(초안, 미검증)** |

손으로 올릴 때:

```bash
scp -i key.pem build/libs/server.jar ubuntu@<서버IP>:/opt/cheongyak-server/
# 서버에서
sudo apt install -y openjdk-17-jre-headless
sudo cp cheongyak-server.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now cheongyak-server
curl http://localhost:8080/actuator/health
```

## 현재 상태

뼈대만 있다. 보안 설정은 **모든 주소가 열려 있는 상태**이고, A 가 JWT 로그인을 붙이면서 막는다 (`auth/SecurityConfig.java` TODO).
