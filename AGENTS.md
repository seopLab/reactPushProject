# 청약소식 — 팀 작업 규칙 (AI·사람 공통)

> 이 파일은 Claude Code(`CLAUDE.md` → `@AGENTS.md`), Codex, Cursor 가 작업할 때마다 자동으로 읽는다.
> **코드·Git 작업 전에 반드시 이 파일의 규칙을 따른다.** 서버 작업은 `server/AGENTS.md` 도 함께 따른다.
> 규칙을 바꾸려면 이 파일을 고치는 PR 을 올리고 팀 Slack 에 공유한다.

## 1. 프로젝트

청약 공고를 모아 회원 조건·내 위치에 맞게 보여 주고 알림을 보내는 모바일 앱 (AI 공고 분석·상담 포함).

| 구분 | 사용 |
|---|---|
| 앱 | React Native + TypeScript + Expo SDK 57 (모바일 전용) — 지금은 레포 루트 (`app/` 이동 예정, WBS 6.5) |
| 서버 | Spring Boot 4 + Java 17 — `server/` |
| DB | Supabase PostgreSQL, 테이블은 Flyway 로만 |
| 서버 배포 | AWS EC2 서울 |
| AI | Gemini |

```
/                 Expo 앱 (App.tsx, src/)
├─ src/
│  ├─ screens/    화면
│  ├─ components/ 공통 UI (바꿀 때 팀 공유)
│  ├─ services/   서버·외부 API 호출
│  ├─ types/      타입
│  ├─ utils/      순수 함수
│  └─ theme.ts    색상·그림자 (공통)
├─ server/        Spring Boot (규칙: server/AGENTS.md)
├─ Documents/     WBS, 진행 정리, 폴더 구조
└─ scripts/       개발용 스크립트
```

## 2. 환경

| 환경 | 브랜치 | DB | 서버 |
|---|---|---|---|
| 로컬 | `feature/*` | H2 메모리 (기본) 또는 Supabase | 내 PC |
| 개발 | `dev` | Supabase `cheongyak-alert` | — |
| 운영 | `main` | Supabase `cheongyak-alert` (같은 DB) | EC2 서울 (예정) |

- **DB 는 Supabase 하나만 쓴다** (토이 프로젝트라 개발·운영 분리 안 함)
- 접속 정보는 노션 「Supabase DB 접속 정보 · 팀원 초대」 페이지 → `server/app.env` 로 복사
- 팀 전체가 같은 DB 를 쓴다. 남의 데이터를 지우지 말고, 대시보드에서 테이블 구조를 직접 바꾸지 않는다

## 3. Git 규칙 (Git Flow 간소화)

```
feature/*  ──merge(PR 없음)──▶  dev  ──PR(배포 시점)──▶  main
 로컬 작업                     개발·통합               운영
```

### 브랜치

| 브랜치 | 용도 | 들어가는 방법 |
|---|---|---|
| `main` | 운영 배포본 | `dev → main` **PR 로만** (직접 push 금지) |
| `dev` | 개발 통합·테스트 | `feature/*` 를 로컬에서 merge 후 push (PR 없음, `dev` 에서 직접 작업·커밋 금지) |
| `feature/<기능>-<설명>` | 내 작업 | 자유롭게 커밋·push |
| `fix/<기능>-<설명>` | 버그 수정 | 자유롭게 커밋·push |

- 이름은 **`<타입>/<기능>-<설명>`**, 영어 소문자 + `-` 만 사용. 사람 이름·날짜는 넣지 않는다
  - 예: `feature/auth-signup`, `feature/collector-schedule`, `feature/infra-supabase-db`, `fix/recommend-radius-filter`
- `<기능>` 은 패키지/폴더 이름: `auth` `member` `recommend` `favorite` `housing` `collector` `notification` `ai` `common` `app` `infra` `docs`
- 브랜치 하나 = 작업 하나. `dev` 에 병합하면 삭제

### 작업 순서 (AI 는 이 순서대로 실행)

```bash
# 1. 시작: 최신 dev 에서 브랜치 만들기
git switch dev && git pull origin dev
git switch -c feature/auth-signup

# 2. 작업 + 커밋 (작게, 자주)
git add <파일>                     # git add . 대신 파일을 지정 (app.env 등 실수 방지)
git commit -m "feat(auth): 회원가입 API 추가"
git push -u origin feature/auth-signup    # 백업·공유용, 언제든 가능

# 3. dev 최신 내용을 내 브랜치에 반영 + 테스트
git fetch origin
git rebase origin/dev              # 충돌 나면 해결 → git add → git rebase --continue
#   (서버) cd server && ./gradlew test   (앱) npx tsc --noEmit
git push --force-with-lease        # rebase 했으면 내 feature 브랜치만 이렇게 push

# 4. dev 에 병합 (PR 없음)
git switch dev && git pull origin dev
git merge --no-ff feature/auth-signup     # 기능 단위로 이력이 묶이게 --no-ff
git push origin dev
git branch -d feature/auth-signup && git push origin --delete feature/auth-signup
```

### 배포: dev → main (PR 필수)

```bash
gh pr create --base main --head dev --title "release: 회원가입·로그인" --body "포함된 기능, 확인한 내용, 새 마이그레이션"
```

- PR 은 **팀원 1명 이상 승인** 후 **Merge commit** 으로 병합
- 병합 후 EC2 에 배포 (`server/README.md` 배포 절차)

### 커밋 메시지

```
<타입>(<기능>): <무엇을 했는지, 한국어>

feat(auth): 회원가입 API 추가
fix(recommend): 지역 조건 필터 누락 수정
refactor(housing): 공고 조회 쿼리 정리
docs: Git 규칙 추가
test(collector): 중복 공고 처리 테스트
chore(server): Gradle 의존성 정리
```

타입: `feat` 기능 / `fix` 버그 / `refactor` 리팩토링 / `docs` 문서 / `test` 테스트 / `chore` 기타

### 절대 하지 않는다 (AI 포함)

- `main` 에 직접 push (PR 로만), `dev` 에서 직접 작업·커밋 (feature 브랜치 merge 만)
- `main`·`dev` 에 force push. `--force-with-lease` 는 내 feature 브랜치에서만
- 비밀값 커밋: `app.env`, `.env*`(`.env.example` 제외), 키·비밀번호가 든 파일
- 이미 `dev`/`main` 에 들어간 Flyway 마이그레이션 파일 수정
- 남의 기능 폴더를 말없이 수정 — 필요하면 담당자에게 먼저 말하기
- 빌드·테스트가 깨진 상태로 `dev` 에 병합

### 충돌이 났을 때

1. 내 변경과 상대 변경을 **둘 다** 읽고 합친다. 한쪽을 통째로 버리지 않는다
2. 남의 코드 쪽 판단이 어려우면 멈추고 담당자에게 묻는다
3. 해결 후 빌드·테스트를 다시 돌린다

## 4. 공통 코드 규칙

- 주석·커밋·PR·사용자에게 보이는 문구는 **한국어**. 식별자는 영어
- 주석은 "왜" 를 짧게. 코드를 그대로 설명하는 주석은 쓰지 않는다
- 비밀값은 코드·`application.yml`·앱 코드에 쓰지 않는다. 서버는 `server/app.env`, 앱은 `.env.local`
- 앱에 넣는 키는 `EXPO_PUBLIC_` 공개 키만. 공공데이터·카카오 REST·Gemini 키는 서버에만
- 공통 파일(`src/components/`, `src/theme.ts`, `server/.../common/`, `SecurityConfig`, `application.yml`, `build.gradle`, `package.json`)을 바꾸면 Slack 에 적는다
- 요청받지 않은 리팩토링·파일 이동·포매팅 변경을 섞지 않는다

## 5. 앱 (Expo) 코드 규칙

- **Expo 는 버전마다 API 가 다르다.** 코드를 쓰기 전에 https://docs.expo.dev/versions/v57.0.0/ 의 해당 문서를 확인한다
- 패키지는 `npx expo install <패키지>` 로 설치 (SDK 57 호환 버전 자동 선택)
- TypeScript `strict`. `any` 쓰지 않는다. 타입은 `src/types/` 에
- 컴포넌트는 **함수 + named export** (`export function HomeScreen()`). default export 는 `App.tsx` 만
- 스타일은 파일 맨 아래 `StyleSheet.create`. 색상·그림자는 `src/theme.ts` 의 `colors`, `shadow` 를 쓰고 색 코드를 직접 쓰지 않는다
- 서버·외부 API 호출은 `src/services/` 에만. 화면에서 `fetch` 를 직접 부르지 않는다
- 서버 오류 응답은 `{ "message": "..." }` → 그 문구를 사용자에게 보여 준다
- 파일 이름: 화면 `XxxScreen.tsx`, 컴포넌트 `PascalCase.tsx`, 그 외 `camelCase.ts`

## 6. AI 에게 맡길 때 체크

- 작업 전: 지금 브랜치가 `feature/*` 인지 확인 (`main`/`dev` 면 새 브랜치부터)
- `dev` 병합 전: 서버는 `cd server && ./gradlew test`, 앱은 `npx tsc --noEmit` 통과 확인
- 공통 파일을 바꿨거나 새 마이그레이션을 추가했으면 `dev` 에 push 한 뒤 Slack 에 한 줄 남기기
- `dev → main` PR 설명에: 포함된 기능, 확인한 방법, 새 마이그레이션 번호
