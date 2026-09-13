import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MapLocationPicker } from '../components/MapLocationPicker';
import { fetchHousingAnnouncements } from '../services/housingApi';
import { colors, shadow } from '../theme';
import { HousingAnnouncement, RadiusOption } from '../types/housing';
import { displayRegion, distanceInKm } from '../utils/geo';

const radiusOptions: RadiusOption[] = [5, 10, 20, 30, 50];
// Temporary records keep the location flow testable until the server API is connected.
const sampleAnnouncements: HousingAnnouncement[] = [
  { id: 'siheung-1', title: '시흥 배곧 청약 공고', address: '경기도 시흥시 배곧동', sido: '경기도', city: '시흥시', district: '정왕동', type: '민간분양', deadline: '접수마감 9/25(금)', dday: 'D-12', source: '청약홈', latitude: 37.371, longitude: 126.735 },
  { id: 'ansan-1', title: '안산 고잔 주거복합', address: '경기도 안산시 단원구 고잔동', sido: '경기도', city: '안산시', district: '단원구', type: '공공분양', deadline: '접수마감 10/02(금)', dday: 'D-19', source: 'LH', latitude: 37.316, longitude: 126.838 },
  { id: 'guro-1', title: '서울 구로 신규 공급', address: '서울특별시 구로구 구로동', sido: '서울특별시', city: '서울특별시', district: '구로구', type: '민간분양', deadline: '접수마감 10/08(목)', dday: 'D-25', source: '청약홈', latitude: 37.495, longitude: 126.887 },
];

const defaultLocation = { latitude: 37.380, longitude: 126.802 };

export function HomeScreen() {
  const [radius, setRadius] = useState<RadiusOption>(10);
  const [coordinates, setCoordinates] = useState(defaultLocation);
  const [locationLabel, setLocationLabel] = useState('경기도 시흥시');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [isRegionPickerVisible, setIsRegionPickerVisible] = useState(false);
  const [announcements, setAnnouncements] = useState(sampleAnnouncements);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataMessage, setDataMessage] = useState('');

  useEffect(() => {
    void useCurrentLocation();
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchHousingAnnouncements()
      .then((items) => {
        if (!isMounted) return;
        setAnnouncements(items.length ? items : sampleAnnouncements);
        setDataMessage(items.length ? '' : '현재 조건에 맞는 공고가 없어 샘플 화면을 보여드려요.');
      })
      .catch(() => {
        if (isMounted) setDataMessage('실제 API에 연결되지 않아 샘플 공고를 보여드려요.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const nearbyAnnouncements = useMemo(() => announcements
    .map((announcement) => ({ ...announcement, distance: distanceInKm(coordinates, announcement) }))
    .filter((announcement) => announcement.distance <= radius)
    .sort((first, second) => first.distance - second.distance), [coordinates, radius]);

  async function useCurrentLocation() {
    setIsLoadingLocation(true);
    setLocationMessage('');

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setLocationMessage('위치 권한이 없어 기본 지역을 보여드려요.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nextCoordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCoordinates(nextCoordinates);

      const places = await Location.reverseGeocodeAsync(nextCoordinates);
      const place = places[0];
      const city = place?.city ?? place?.subregion ?? '현재 위치';
      const district = place?.district ? ` ${place.district}` : '';
      setLocationLabel(`${place?.region ?? ''} ${city}${district}`.trim());
    } catch {
      setLocationMessage('현재 위치를 확인하지 못했어요. 지역을 직접 선택해주세요.');
    } finally {
      setIsLoadingLocation(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}><View><Text style={styles.eyebrow}>지성님, 안녕하세요</Text><Text style={styles.title}>오늘의 청약 소식이에요</Text></View><Pressable style={styles.bell} accessibilityLabel="알림"><Text style={styles.bellText}>♧</Text></Pressable></View>
      <View style={styles.locationRow}><View style={styles.location}><Text style={styles.locationIcon}>•</Text><Text style={styles.locationText}>{locationLabel}</Text></View><Pressable onPress={useCurrentLocation} style={styles.locationButton}><Text style={styles.locationButtonText}>{isLoadingLocation ? '확인 중' : '현재 위치'}</Text></Pressable></View>
      {locationMessage ? <Text style={styles.locationMessage}>{locationMessage}</Text> : null}

      <Text style={styles.filterTitle}>내 위치에서 가까운 청약</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.radiusRow}>{radiusOptions.map((option) => <Pressable key={option} onPress={() => setRadius(option)} style={[styles.radius, radius === option && styles.radiusActive]}><Text style={[styles.radiusText, radius === option && styles.radiusTextActive]}>{option}km</Text></Pressable>)}<Pressable onPress={() => setIsRegionPickerVisible(true)} style={styles.radius}><Text style={styles.radiusText}>지역 선택</Text></Pressable></ScrollView>

      <View style={styles.resultHeader}><Text style={styles.sectionTitle}>{radius}km 안의 청약</Text><Text style={styles.count}>{nearbyAnnouncements.length}건</Text></View>
      {isLoadingData ? <View style={styles.loading}><Text style={styles.loadingText}>실제 청약 정보를 불러오는 중이에요.</Text></View> : null}
      {dataMessage ? <Text style={styles.dataMessage}>{dataMessage}</Text> : null}
      {nearbyAnnouncements.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>주변 청약이 아직 없어요</Text><Text style={styles.emptyText}>반경을 넓히거나 다른 지역을 선택해보세요.</Text></View> : nearbyAnnouncements.map((item) => <Pressable key={item.id} style={styles.announcement}><View style={styles.announcementTop}><Text style={styles.source}>{item.source}</Text><Text style={styles.distance}>{item.distance.toFixed(1)}km</Text></View><Text style={styles.announcementTitle}>{item.title}</Text><Text style={styles.announcementRegion}>{displayRegion(item.sido, item.city, item.district)} · {item.type}</Text><Text style={styles.deadline}>{item.deadline} · {item.dday}</Text></Pressable>)}

      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>나의 관심 청약</Text><Text style={styles.sectionLink}>전체보기</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favoriteRow}><View style={[styles.favoriteCard, { backgroundColor: colors.peach }]}><Text style={styles.heart}>♥</Text><Text style={styles.favoriteTitle}>관심 공고를 추가해보세요</Text><Text style={styles.favoriteInfo}>마감일을 놓치지 않게 알려드려요.</Text></View><View style={[styles.favoriteCard, { backgroundColor: colors.mint }]}><Text style={styles.favoriteTitle}>내 조건 설정하기</Text><Text style={styles.favoriteInfo}>맞춤 청약을 더 빠르게 찾아요.</Text></View></ScrollView>
      <MapLocationPicker visible={isRegionPickerVisible} initialCoordinates={coordinates} onClose={() => setIsRegionPickerVisible(false)} onSelect={(selection) => { setCoordinates({ latitude: selection.latitude, longitude: selection.longitude }); setLocationLabel(selection.label); setIsRegionPickerVisible(false); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, backgroundColor: colors.background, flexGrow: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  eyebrow: { color: '#9b897b', fontSize: 13, marginBottom: 5 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '800' },
  bell: { ...shadow, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  bellText: { color: colors.ink, fontSize: 21 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  location: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.softOrange, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 7 },
  locationIcon: { color: colors.orange, fontSize: 17, fontWeight: '800', marginRight: 5 },
  locationText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  locationButton: { marginLeft: 8, paddingHorizontal: 10, paddingVertical: 7 },
  locationButtonText: { color: colors.orange, fontSize: 12, fontWeight: '700' },
  locationMessage: { color: colors.muted, fontSize: 12, marginBottom: 12 },
  loading: { backgroundColor: colors.surface, borderRadius: 17, padding: 18, alignItems: 'center' },
  loadingText: { color: colors.muted, fontSize: 12 },
  dataMessage: { color: colors.muted, fontSize: 11, marginBottom: 8 },
  filterTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginTop: 14, marginBottom: 12 },
  radiusRow: { paddingBottom: 4, gap: 8, alignItems: 'center' },
  radius: { height: 36, minWidth: 58, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 15 },
  radiusActive: { backgroundColor: colors.ink },
  radiusText: { color: colors.muted, fontSize: 12, fontWeight: '700', lineHeight: 16 },
  radiusTextActive: { color: colors.surface },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  count: { color: colors.orange, fontSize: 12, fontWeight: '800', marginLeft: 7 },
  announcement: { ...shadow, backgroundColor: colors.surface, borderRadius: 17, padding: 15, marginBottom: 10 },
  announcementTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  source: { color: colors.orange, fontSize: 11, fontWeight: '800' },
  distance: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  announcementTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', marginBottom: 5 },
  announcementRegion: { color: colors.muted, fontSize: 12, marginBottom: 8 },
  deadline: { color: '#9b897b', fontSize: 11 },
  empty: { backgroundColor: colors.surface, borderRadius: 17, padding: 22, alignItems: 'center' },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: colors.muted, fontSize: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 13 },
  sectionLink: { color: colors.muted, fontSize: 12 },
  favoriteRow: { paddingRight: 8 },
  favoriteCard: { width: 174, minHeight: 125, borderRadius: 18, padding: 14, marginRight: 11 },
  heart: { color: '#f26f5c', fontSize: 18, marginBottom: 20 },
  favoriteTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', marginBottom: 6 },
  favoriteInfo: { color: '#555', fontSize: 11, lineHeight: 17 },
});
