import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, shadow } from '../theme';

const weeks = ['전체', '이번 주', '다음 주', '이번 달'];
const schedule = [
  { day: '22', weekday: '목', title: '동탄 롯데캐슬', detail: '경기 화성시 · 특별공급', type: '접수 시작', tone: 'orange' },
  { day: '27', weekday: '화', title: '위례 자이 엘리트', detail: '서울 송파구 · 1순위', type: '접수 시작', tone: 'orange' },
  { day: '31', weekday: '토', title: 'e편한마당 청라', detail: '인천 서구 · 당첨자 발표', type: '발표', tone: 'green' },
];

export function ScheduleScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="CALENDAR" title="청약 일정" description="관심 지역의 중요한 일정을 한눈에 확인해요." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {weeks.map((week, index) => <Pressable key={week} style={[styles.filter, index === 0 && styles.filterActive]}><Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{week}</Text></Pressable>)}
      </ScrollView>
      <View style={styles.monthRow}><Text style={styles.month}>2026년 8월</Text><Text style={styles.count}>일정 3건</Text></View>
      {schedule.map((item) => (
        <Pressable key={item.title} style={styles.card}>
          <View style={[styles.date, item.tone === 'green' && styles.dateGreen]}><Text style={styles.day}>{item.day}</Text><Text style={styles.weekday}>{item.weekday}</Text></View>
          <View style={styles.copy}><Text style={styles.title}>{item.title}</Text><Text style={styles.detail}>{item.detail}</Text></View>
          <View style={[styles.badge, item.tone === 'green' && styles.badgeGreen]}><Text style={styles.badgeText}>{item.type}</Text></View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, backgroundColor: colors.background, flexGrow: 1 },
  filterRow: { gap: 8, paddingBottom: 24 },
  filter: { backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 9 },
  filterActive: { backgroundColor: colors.ink },
  filterText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: colors.surface },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  month: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  count: { color: colors.muted, fontSize: 12 },
  card: { ...shadow, backgroundColor: colors.surface, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  date: { width: 52, height: 58, borderRadius: 14, backgroundColor: colors.softOrange, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  dateGreen: { backgroundColor: colors.mint },
  day: { color: colors.orange, fontSize: 20, fontWeight: '800' },
  weekday: { color: colors.muted, fontSize: 11, marginTop: 2 },
  copy: { flex: 1 },
  title: { color: colors.ink, fontSize: 15, fontWeight: '700', marginBottom: 5 },
  detail: { color: colors.muted, fontSize: 12 },
  badge: { backgroundColor: colors.softRed, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  badgeGreen: { backgroundColor: colors.mint },
  badgeText: { color: colors.ink, fontSize: 10, fontWeight: '700' },
});
