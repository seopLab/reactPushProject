import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '../theme';

const favorites = [
  { title: '힐스테이트 광교', info: '경기 수원시 · 특별공급', dday: 'D-5', color: colors.peach },
  { title: '센트럴 푸르지오', info: '서울 성동구 · 1순위', dday: 'D-5', color: colors.mint },
];

const schedules = [
  { day: '22', weekday: '목', title: '동탄 롯데캐슬', detail: '경기 화성시 · 특별공급', active: true },
  { day: '27', weekday: '화', title: '위례 자이 엘리트', detail: '서울 송파구 · 1순위', active: false },
  { day: '31', weekday: '토', title: 'e편한마당 청라', detail: '인천 서구 · 당첨자 발표', active: false },
];

export function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}><View><Text style={styles.eyebrow}>지성님, 안녕하세요</Text><Text style={styles.title}>오늘의 청약 소식이에요</Text></View><Pressable style={styles.bell} accessibilityLabel="알림"><Text style={styles.bellText}>♧</Text></Pressable></View>
      <View style={styles.location}><Text style={styles.locationIcon}>•</Text><Text style={styles.locationText}>서울 강남구</Text><Text style={styles.down}>⌄</Text></View>
      <Pressable style={styles.hero}><View style={styles.heroTop}><Text style={styles.heroTag}>마감 임박</Text><Text style={styles.heroDday}>D-2</Text></View><Text style={styles.heroTitle}>래미안 메가시티 자이{`\n`}청약 접수가 곧 마감돼요</Text><Text style={styles.heroDate}>접수마감 8/25(화) 18:00</Text><View style={styles.heroArrow}><Text style={styles.heroArrowText}>›</Text></View></Pressable>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>나의 관심 청약</Text><Text style={styles.sectionLink}>전체보기</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favoriteRow}>{favorites.map((item) => <Pressable key={item.title} style={[styles.favoriteCard, { backgroundColor: item.color }]}><View style={styles.favoriteTop}><Text style={styles.heart}>♥</Text><Text style={styles.dday}>{item.dday}</Text></View><Text style={styles.favoriteTitle}>{item.title}</Text><Text style={styles.favoriteInfo}>{item.info}</Text></Pressable>)}</ScrollView>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>이번 달 청약 일정</Text></View>
      <View>{schedules.map((item) => <Pressable key={item.title} style={styles.schedule}><View style={[styles.date, item.active && styles.dateActive]}><Text style={[styles.dateDay, item.active && styles.dateTextActive]}>{item.day}</Text><Text style={[styles.dateWeekday, item.active && styles.dateTextActive]}>{item.weekday}</Text></View><View style={styles.scheduleCopy}><Text style={styles.scheduleTitle}>{item.title}</Text><Text style={styles.scheduleDetail}>{item.detail}</Text></View><Text style={styles.arrow}>›</Text></Pressable>)}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, backgroundColor: colors.background, flexGrow: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  eyebrow: { color: '#9b897b', fontSize: 13, marginBottom: 5 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '800' },
  bell: { ...shadow, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  bellText: { color: colors.ink, fontSize: 21 },
  location: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: colors.softOrange, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 7, marginBottom: 16 },
  locationIcon: { color: colors.orange, fontSize: 17, fontWeight: '800', marginRight: 5 },
  locationText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  down: { color: colors.muted, fontSize: 17, marginLeft: 6 },
  hero: { backgroundColor: colors.orange, borderRadius: 20, padding: 17, minHeight: 150, ...shadow },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  heroTag: { color: colors.surface, fontSize: 12, fontWeight: '700' },
  heroDday: { color: colors.surface, fontSize: 16, fontWeight: '800' },
  heroTitle: { color: colors.surface, fontSize: 18, lineHeight: 26, fontWeight: '800' },
  heroDate: { color: colors.surface, fontSize: 12, marginTop: 10, opacity: 0.9 },
  heroArrow: { position: 'absolute', right: 17, bottom: 17, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  heroArrowText: { color: colors.surface, fontSize: 28, lineHeight: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 13 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  sectionLink: { color: colors.muted, fontSize: 12 },
  favoriteRow: { paddingRight: 8 },
  favoriteCard: { width: 174, minHeight: 137, borderRadius: 18, padding: 14, marginRight: 11 },
  favoriteTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 23 },
  heart: { backgroundColor: colors.surface, color: '#f26f5c', width: 27, height: 27, borderRadius: 14, textAlign: 'center', lineHeight: 27, fontSize: 14 },
  dday: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  favoriteTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginBottom: 5 },
  favoriteInfo: { color: '#555', fontSize: 11 },
  schedule: { ...shadow, backgroundColor: colors.surface, borderRadius: 15, padding: 11, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  date: { width: 46, height: 55, borderRadius: 12, backgroundColor: '#f1f1f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  dateActive: { backgroundColor: colors.orange },
  dateDay: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  dateWeekday: { color: colors.muted, fontSize: 10, marginTop: 2 },
  dateTextActive: { color: colors.surface },
  scheduleCopy: { flex: 1 },
  scheduleTitle: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  scheduleDetail: { color: colors.muted, fontSize: 11 },
  arrow: { color: '#aaa', fontSize: 25 },
});
