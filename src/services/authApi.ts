import { SignupRequest, SignupResponse } from '../types/signup';
import { getDevServerUrl } from './devServer';

// Spring Boot 서버(server/, 8080). 지금은 입력값 검사만 하고 저장하지 않는다
export async function signup(request: SignupRequest): Promise<SignupResponse> {
  let response: Response;
  try {
    response = await fetch(`${getDevServerUrl(8080)}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error('서버에 연결하지 못했어요. Spring Boot 서버(8080)가 켜져 있는지 확인해 주세요.');
  }

  const body = await response.json().catch(() => ({})) as Partial<SignupResponse>;
  if (!response.ok) throw new Error(body.message || '회원가입에 실패했어요.');
  return body as SignupResponse;
}
