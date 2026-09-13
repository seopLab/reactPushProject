import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envPath = path.join(root, '.env.local');
const env = {};

for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([^#=]+)=(.*)$/);
  if (!match) continue;
  let value = match[2].trim().replace(/;\s*$/, '');
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[match[1].trim()] = value;
}

const port = 8787;
const geocodeCache = new Map();

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  response.end(JSON.stringify(body));
}

async function geocode(address) {
  if (geocodeCache.has(address)) return geocodeCache.get(address);
  if (!env.KAKAO_REST_API_KEY) return null;
  const url = new URL('https://dapi.kakao.com/v2/local/search/address.json');
  url.searchParams.set('query', address);
  const response = await fetch(url, { headers: { Authorization: `KakaoAK ${env.KAKAO_REST_API_KEY}` } });
  if (!response.ok) {
    throw new Error(`카카오 주소 검색 API ${response.status}`);
  }
  const body = await response.json();
  const document = body.documents?.[0];
  const result = document ? { latitude: Number(document.y), longitude: Number(document.x) } : null;
  geocodeCache.set(address, result);
  return result;
}

async function getHousing() {
  const url = new URL('https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail');
  url.searchParams.set('page', '1');
  url.searchParams.set('perPage', '50');
  url.searchParams.set('cond[RCRIT_PBLANC_DE::LTE]', new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10));
  url.searchParams.set('cond[RCRIT_PBLANC_DE::GTE]', new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10));
  const serviceKey = decodeURIComponent(env.REB_SUPPLY_INFO_API_KEY);
  url.searchParams.set('serviceKey', serviceKey);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`청약홈 API ${response.status}`);
  const body = await response.json();
  const data = [];

  for (const item of body.data ?? []) {
    const coordinates = await geocode(item.HSSPLY_ADRES);
    if (!coordinates) continue;
    data.push({
      id: item.HOUSE_MANAGE_NO || item.PBLANC_NO,
      title: item.HOUSE_NM || '청약 공고',
      address: item.HSSPLY_ADRES,
      sido: item.SUBSCRPT_AREA_CODE_NM === '서울' ? '서울특별시' : item.SUBSCRPT_AREA_CODE_NM || '',
      city: item.HSSPLY_ADRES?.match(/([가-힣]+시)/)?.[1] || '',
      district: item.HSSPLY_ADRES?.match(/([가-힣]+구)/)?.[1],
      type: item.RENT_SECD_NM || item.HOUSE_DTL_SECD_NM || '분양',
      deadline: item.RCEPT_ENDDE ? `접수마감 ${item.RCEPT_ENDDE}` : '접수일정 확인 필요',
      dday: item.RCEPT_ENDDE || '',
      source: '청약홈',
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      detailUrl: item.PBLANC_URL,
    });
  }

  return data;
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': 'Content-Type' });
    response.end();
    return;
  }

  if (request.url === '/api/health') {
    json(response, 200, { ok: true });
    return;
  }

  if (request.url === '/api/housing') {
    try {
      json(response, 200, { data: await getHousing() });
    } catch (error) {
      json(response, 502, { error: error instanceof Error ? error.message : 'API 요청 실패' });
    }
    return;
  }

  json(response, 404, { error: 'Not found' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Housing API proxy listening on http://0.0.0.0:${port}`);
});
