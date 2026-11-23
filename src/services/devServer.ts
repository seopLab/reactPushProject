import Constants from 'expo-constants';

// 개발 중에는 Expo 를 띄운 PC 에서 서버도 돌린다. 폰에서도 닿도록 Expo 가 쓰는 PC 주소를 그대로 쓴다
export function getDevServerUrl(port: number) {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0] || 'localhost';
  return `http://${host}:${port}`;
}
