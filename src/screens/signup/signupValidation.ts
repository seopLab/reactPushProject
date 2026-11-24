// 계정 정보 입력 규칙. 서버 SignupRequest 검증과 같은 기준을 유지한다
export const LOGIN_ID_PATTERN = /^[a-z0-9_]{4,20}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)\S{8,20}$/;

export type AccountInput = { loginId: string; email: string; password: string; passwordConfirm: string; nickname: string };
export type AccountErrors = Partial<Record<keyof AccountInput, string>>;

// 빈 칸은 아직 입력 전이라 오류로 보여 주지 않는다 (다음 버튼만 막는다)
export function accountErrors(input: AccountInput): AccountErrors {
  const errors: AccountErrors = {};
  if (input.loginId && !LOGIN_ID_PATTERN.test(input.loginId)) errors.loginId = '영문 소문자·숫자·_ 로 4~20자 입력해 주세요.';
  if (input.email && !EMAIL_PATTERN.test(input.email.trim())) errors.email = '이메일 형식을 확인해 주세요.';
  if (input.password && !PASSWORD_PATTERN.test(input.password)) errors.password = '영문과 숫자를 섞어 8~20자로 입력해 주세요. (공백 제외)';
  if (input.passwordConfirm && input.passwordConfirm !== input.password) errors.passwordConfirm = '비밀번호가 일치하지 않아요.';
  const nickname = input.nickname.trim();
  if (input.nickname && (nickname.length < 2 || nickname.length > 20)) errors.nickname = '닉네임은 2~20자로 입력해 주세요.';
  return errors;
}

export function isAccountComplete(input: AccountInput) {
  const filled = input.loginId !== '' && input.email.trim() !== '' && input.password !== '' && input.passwordConfirm !== '' && input.nickname.trim() !== '';
  return filled && Object.keys(accountErrors(input)).length === 0;
}
