import Constants from 'expo-constants';
import { HousingAnnouncement } from '../types/housing';

function getProxyUrl() {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0] || 'localhost';
  return `http://${host}:8787`;
}

export async function fetchHousingAnnouncements(): Promise<HousingAnnouncement[]> {
  const response = await fetch(`${getProxyUrl()}/api/housing`);
  if (!response.ok) throw new Error('청약 정보를 가져오지 못했어요.');
  const body = await response.json() as { data?: HousingAnnouncement[]; error?: string };
  if (body.error) throw new Error(body.error);
  return body.data ?? [];
}
