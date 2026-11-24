import { useEffect, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../../components/ScreenHeader';
import { signup } from '../../services/authApi';
import { colors } from '../../theme';
import { SignupRequest, SignupResponse } from '../../types/signup';
import { AccountStep, ConditionsStep, ConsentStep, DocumentsStep, DoneStep, InfoStep, SignupDraft } from './SignupSteps';
import { isAccountComplete } from './signupValidation';

type Step = 'consent' | 'account' | 'info' | 'conditions' | 'documents' | 'done';

const order: Step[] = ['consent', 'account', 'info', 'conditions', 'documents', 'done'];
const PROGRESS_STEPS = 4;

// 약관 동의 → 계정 정보 → Figma 02~04 의 입력 3단계
const stepCopy: Record<Step, { eyebrow: string; title: string; description: string; button: string; progress?: number }> = {
  consent: { eyebrow: '시작 · 약관 동의', title: '서비스 이용 동의', description: '청약소식을 이용하려면 아래 내용을 확인하고 동의해 주세요.', button: '동의하고 시작하기' },
  account: { eyebrow: '1/4 · 계정 정보', title: '계정 만들기', description: '로그인에 사용할 아이디와 비밀번호를 정해 주세요.', button: '다음 · 기본 정보', progress: 1 },
  info: { eyebrow: '2/4 · 기본 정보', title: '내 기본 정보', description: '내 위치와 가구 정보를 설정하면 가까운 공고부터 찾아드려요.', button: '다음 · 청약 조건', progress: 2 },
  conditions: { eyebrow: '3/4 · 청약 조건', title: '청약 조건 설정', description: '관심 조건은 언제든 마이페이지에서 수정할 수 있어요.', button: '다음 · 서류 준비', progress: 3 },
  documents: { eyebrow: '4/4 · 서류 준비', title: '미리 챙길 서류', description: '공고별 제출 서류와 시기는 다를 수 있어요.', button: '등록하고 홈으로', progress: 4 },
  done: { eyebrow: '가입 완료', title: '회원가입이 완료됐어요', description: '', button: '홈으로' },
};

const emptyDraft: SignupDraft = {
  termsAgreed: false,
  privacyAgreed: false,
  locationAgreed: false,
  notificationAgreed: false,
  loginId: '',
  email: '',
  password: '',
  passwordConfirm: '',
  nickname: '',
  region: '',
  birthDate: '',
  householdSize: null,
  housingOwnership: null,
  supplyTypes: [],
  hasSubscriptionAccount: null,
  years: '',
  months: '',
  extraConditions: [],
  preparedDocuments: [],
};

function isValidBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  // 2월 30일처럼 없는 날짜는 다음 달로 넘어가므로 다시 비교한다
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && year >= 1900 && date < new Date();
}

function canProceed(step: Step, draft: SignupDraft) {
  if (step === 'consent') return draft.termsAgreed && draft.privacyAgreed;
  if (step === 'account') return isAccountComplete(draft);
  if (step === 'info') return draft.region.trim() !== '' && isValidBirthDate(draft.birthDate) && draft.householdSize !== null && draft.housingOwnership !== null;
  if (step === 'conditions') return draft.supplyTypes.length > 0 && draft.hasSubscriptionAccount !== null;
  return true;
}

function toRequest(draft: SignupDraft): SignupRequest {
  const hasPeriod = draft.years !== '' || draft.months !== '';
  return {
    termsAgreed: draft.termsAgreed,
    privacyAgreed: draft.privacyAgreed,
    locationAgreed: draft.locationAgreed,
    notificationAgreed: draft.notificationAgreed,
    loginId: draft.loginId,
    email: draft.email.trim(),
    password: draft.password,
    nickname: draft.nickname.trim(),
    region: draft.region.trim(),
    birthDate: draft.birthDate,
    householdSize: draft.householdSize ?? 0,
    housingOwnership: draft.housingOwnership ?? 'NONE',
    supplyTypes: draft.supplyTypes,
    hasSubscriptionAccount: draft.hasSubscriptionAccount ?? false,
    subscriptionMonths: draft.hasSubscriptionAccount && hasPeriod ? Number(draft.years || 0) * 12 + Number(draft.months || 0) : null,
    extraConditions: draft.extraConditions,
    preparedDocuments: draft.preparedDocuments,
  };
}

type Props = { onClose: () => void; onComplete: () => void };

export function SignupScreen({ onClose, onComplete }: Props) {
  const [step, setStep] = useState<Step>('consent');
  const [draft, setDraft] = useState(emptyDraft);
  const [result, setResult] = useState<SignupResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const copy = stepCopy[step];
  const update = (patch: Partial<SignupDraft>) => setDraft((current) => ({ ...current, ...patch }));

  function goTo(next: Step) {
    setError('');
    setStep(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function goBack() {
    if (step === 'consent') onClose();
    else if (step !== 'done') goTo(order[order.indexOf(step) - 1]);
  }

  // 안드로이드 뒤로 버튼도 이전 단계로
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 'done') onComplete();
      else goBack();
      return true;
    });
    return () => subscription.remove();
  });

  async function submit() {
    setIsSubmitting(true);
    setError('');
    try {
      setResult(await signup(toRequest(draft)));
      goTo('done');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '회원가입에 실패했어요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNext() {
    if (step === 'documents') void submit();
    else if (step === 'done') onComplete();
    else goTo(order[order.indexOf(step) + 1]);
  }

  const disabled = isSubmitting || !canProceed(step, draft);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        {step !== 'done' ? (
          <Pressable accessibilityRole="button" accessibilityLabel="뒤로" hitSlop={10} onPress={goBack} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : null}
        <Text style={styles.headerTitle}>회원가입</Text>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {copy.progress ? (
          <View style={styles.progress}>
            {Array.from({ length: PROGRESS_STEPS }, (_, index) => index + 1).map((bar) => <View key={bar} style={[styles.progressBar, bar <= (copy.progress ?? 0) && styles.progressBarOn]} />)}
          </View>
        ) : null}
        <ScreenHeader eyebrow={copy.eyebrow} title={copy.title} description={step === 'done' ? result?.message : copy.description} />

        {step === 'consent' && <ConsentStep draft={draft} update={update} />}
        {step === 'account' && <AccountStep draft={draft} update={update} />}
        {step === 'info' && <InfoStep draft={draft} update={update} />}
        {step === 'conditions' && <ConditionsStep draft={draft} update={update} />}
        {step === 'documents' && <DocumentsStep draft={draft} update={update} />}
        {step === 'done' && result && <DoneStep result={result} />}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable accessibilityRole="button" disabled={disabled} onPress={handleNext} style={[styles.button, disabled && styles.buttonDisabled]}>
          <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>{isSubmitting ? '확인 중…' : copy.button}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { height: 56, alignItems: 'center', justifyContent: 'center' },
  back: { position: 'absolute', left: 12, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.ink, fontSize: 32, lineHeight: 34 },
  headerTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  content: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 24 },
  progress: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.disabled },
  progressBarOn: { backgroundColor: colors.brand },
  error: { color: colors.error, backgroundColor: '#fde8e6', borderRadius: 12, padding: 14, fontSize: 13, marginTop: 18 },
  footer: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 16, backgroundColor: colors.cream },
  button: { height: 56, borderRadius: 16, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { backgroundColor: colors.disabled },
  buttonText: { color: colors.surface, fontSize: 17, fontWeight: '800' },
  buttonTextDisabled: { color: colors.disabledText },
});
