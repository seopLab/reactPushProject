import { HousingAnnouncement } from '../types/housing';
import { getDevServerUrl } from './devServer';

export async function fetchHousingAnnouncements(): Promise<HousingAnnouncement[]> {
  const response = await fetch(`${getDevServerUrl(8787)}/api/housing`);
  if (!response.ok) throw new Error('청약 정보를 가져오지 못했어요.');
  const body = await response.json() as { data?: HousingAnnouncement[]; error?: string };
  if (body.error) throw new Error(body.error);
  return body.data ?? [];
}
