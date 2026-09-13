import { Coordinates } from '../types/housing';

const EARTH_RADIUS_KM = 6371;

export function distanceInKm(from: Coordinates, to: Coordinates) {
  const latitudeDelta = ((to.latitude - from.latitude) * Math.PI) / 180;
  const longitudeDelta = ((to.longitude - from.longitude) * Math.PI) / 180;
  const fromLatitude = (from.latitude * Math.PI) / 180;
  const toLatitude = (to.latitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function displayRegion(sido: string, city: string, district?: string) {
  if (sido === '서울특별시' && district) {
    return `서울 ${district}`;
  }

  return `${sido.replace('특별자치도', '').replace('광역시', '시')} ${city}`;
}
