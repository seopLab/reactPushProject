// 서버 server/.../auth/SignupRequest.java 와 같은 모양을 유지한다
export type HousingOwnership = 'NONE' | 'ONE' | 'TWO_PLUS';
export type SupplyType = 'PRIVATE_SALE' | 'PUBLIC_SALE' | 'PUBLIC_RENTAL' | 'NEWLYWED_HOPE_TOWN';
export type ExtraCondition = 'NEWLYWED' | 'FIRST_HOME' | 'MULTI_CHILD' | 'ELDERLY_PARENT' | 'YOUTH';
export type DocumentType = 'RESIDENT_REGISTRATION' | 'FAMILY_RELATION' | 'SUBSCRIPTION_ACCOUNT' | 'INCOME_ASSET';

export type AgreementKey = 'termsAgreed' | 'privacyAgreed' | 'locationAgreed' | 'notificationAgreed';

export type SignupRequest = Record<AgreementKey, boolean> & {
  region: string;
  latitude: number | null;
  longitude: number | null;
  birthDate: string; // YYYY-MM-DD
  householdSize: number; // 4 = 4명 이상
  housingOwnership: HousingOwnership;
  supplyTypes: SupplyType[];
  hasSubscriptionAccount: boolean;
  subscriptionMonths: number | null;
  extraConditions: ExtraCondition[];
  preparedDocuments: DocumentType[];
};

export type SignupResponse = {
  message: string;
  saved: boolean;
  received: SignupRequest;
};
