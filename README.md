# 청약정보 알림 앱

React Native(Expo)와 Firebase를 이용해 청약 공고를 수집하고 사용자 조건에 맞는 알림을 보내는 앱입니다.

## 권장 구성

- 앱: React Native + Expo + TypeScript
- 인증/데이터: Firebase Authentication, Firestore
- 푸시: Firebase Cloud Messaging을 Expo Notifications/EAS와 연동
- 수집/알림 처리: Firebase Cloud Functions 또는 별도 수집 서버
- 자동화: GitHub Actions + EAS Build/Submit

## 시작 전 준비

1. Node.js LTS와 Git 설치
2. Android Studio와 Android SDK 설치
3. iOS 빌드가 필요하면 macOS/Xcode 또는 EAS Build 사용
4. Expo 계정과 EAS CLI 준비
5. Firebase 프로젝트 생성
6. Android 앱 패키지명과 iOS Bundle ID 결정
7. 공공데이터포털 또는 청약홈 데이터 이용 정책과 호출 제한 확인
8. 알림 동의, 개인정보 처리방침, 회원 탈퇴/데이터 삭제 정책 준비
9. GitHub 저장소 Secrets에 `EXPO_TOKEN` 등록

## 로컬 실행

Node.js 설치 후 새 터미널에서 아래 명령을 실행합니다.

```powershell
npx create-expo-app@latest . --template blank-typescript
npm install firebase expo-notifications expo-device expo-constants
npx expo start
```

EAS 명령은 프로젝트에 설치하지 않고 필요할 때 `npx eas-cli`로 실행합니다.

푸시 알림과 네이티브 Firebase 설정은 Expo Go만으로는 제한될 수 있으므로, 실제 기기 검증은 EAS Development Build를 사용합니다.

## 다음 구현 순서

1. Firebase 프로젝트와 앱 등록
2. 청약 공고 데이터 모델 및 수집 주기 정의
3. 관심 지역/주택 유형/면적 필터 화면 구현
4. 푸시 토큰 등록 및 알림 권한 처리
5. 중복 발송 방지와 알림 이력 저장
6. GitHub Actions에서 타입 검사, 테스트, EAS 빌드 자동화

## 현재 화면 구조

- `App.tsx`: 현재 탭과 화면 전환을 조합하는 진입점
- `src/screens/HomeScreen.tsx`: 홈 대시보드
- `src/screens/ScheduleScreen.tsx`: 청약 일정
- `src/screens/FavoritesScreen.tsx`: 관심 청약
- `src/screens/NotificationsScreen.tsx`: 알림 설정
- `src/screens/ProfileScreen.tsx`: 마이페이지
- `src/components/BottomTabBar.tsx`: 공통 하단 탭
- `src/components/ScreenHeader.tsx`: 공통 화면 헤더
- `src/theme.ts`: 색상과 그림자 토큰

## 탭 다음에 필요한 세팅

1. React Navigation 또는 현재 탭 상태를 실제 URL/뒤로가기 흐름과 연결
2. 청약 공고 상세 화면과 공통 `HouseCard` 컴포넌트 추가
3. mock data를 `types/`와 `services/`로 분리
4. Firebase Authentication, Firestore 컬렉션, 보안 규칙 설정
5. 알림 권한 요청과 Expo push token 저장 구현
6. Android/iOS 앱 식별자와 Firebase 설정 파일 등록
7. 관심 조건 변경, 토글, 필터를 로컬 상태에서 Firestore로 연결
8. 빈 상태, 로딩, 오류, 네트워크 재시도 화면 추가