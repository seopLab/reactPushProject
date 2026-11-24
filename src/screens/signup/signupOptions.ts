import { AgreementKey, DocumentType, ExtraCondition, HousingOwnership, SupplyType } from '../../types/signup';

export type Option<T> = { value: T; label: string };

export const agreements: { key: AgreementKey; label: string; required: boolean; detail: string }[] = [
  { key: 'termsAgreed', label: '서비스 이용약관', required: true, detail: '청약소식 서비스 이용에 관한 기본 약관입니다. (실제 약관 문구는 확정 후 교체)' },
  { key: 'privacyAgreed', label: '개인정보 수집·이용', required: true, detail: '수집 항목: 아이디, 이메일, 비밀번호(암호화 저장), 닉네임, 알림 기준 지역, 생년월일, 가구원 수, 주택 보유 여부, 청약 조건, 서류 준비 상태\n목적: 맞춤 청약 공고 추천 및 알림\n보관: 회원 탈퇴 시 즉시 삭제\n서류 원본은 저장하지 않습니다.' },
  { key: 'locationAgreed', label: '위치정보 이용', required: false, detail: '현재 위치로 알림 기준 지역을 설정할 때만 사용합니다. 동의하지 않아도 지역을 직접 입력할 수 있어요.' },
  { key: 'notificationAgreed', label: '청약 알림 수신', required: false, detail: '새 공고, 마감 임박, 당첨자 발표 알림을 보내드려요. 마이페이지에서 언제든 끌 수 있어요.' },
];

export const householdOptions: Option<number>[] = [
  { value: 1, label: '1명' },
  { value: 2, label: '2명' },
  { value: 3, label: '3명' },
  { value: 4, label: '4명+' },
];

export const housingOptions: Option<HousingOwnership>[] = [
  { value: 'NONE', label: '무주택' },
  { value: 'ONE', label: '1주택' },
  { value: 'TWO_PLUS', label: '2주택+' },
];

export const supplyOptions: Option<SupplyType>[] = [
  { value: 'PRIVATE_SALE', label: '민간분양' },
  { value: 'PUBLIC_SALE', label: '공공분양' },
  { value: 'PUBLIC_RENTAL', label: '공공임대' },
  { value: 'NEWLYWED_HOPE_TOWN', label: '신혼희망타운' },
];

export const accountOptions: Option<boolean>[] = [
  { value: true, label: '가입했어요' },
  { value: false, label: '아직 없어요' },
];

export const extraOptions: Option<ExtraCondition>[] = [
  { value: 'NEWLYWED', label: '신혼부부' },
  { value: 'FIRST_HOME', label: '생애최초' },
  { value: 'MULTI_CHILD', label: '다자녀' },
  { value: 'ELDERLY_PARENT', label: '노부모부양' },
  { value: 'YOUTH', label: '청년' },
];

export const documentOptions: (Option<DocumentType> & { description: string })[] = [
  { value: 'RESIDENT_REGISTRATION', label: '주민등록등본', description: '세대 구성 확인' },
  { value: 'FAMILY_RELATION', label: '가족관계증명서', description: '가구 · 혼인 관계 확인' },
  { value: 'SUBSCRIPTION_ACCOUNT', label: '청약통장 가입 확인서', description: '가입 기간 · 납입 내역' },
  { value: 'INCOME_ASSET', label: '소득 · 자산 증빙', description: '공급 유형에 따라 달라요' },
];

export function labelOf<T>(options: Option<T>[], value: T) {
  return options.find((option) => option.value === value)?.label ?? String(value);
}

export function labelsOf<T>(options: Option<T>[], values: T[]) {
  return values.length ? values.map((value) => labelOf(options, value)).join(', ') : '없음';
}
