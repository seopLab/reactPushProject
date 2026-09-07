import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, shadow } from '../theme';

const alerts = [
  { title: '관심 지역 새 공고', description: '서울 강남구에 새 청약이 올라오면 알려드려요.', enabled: true },
  { title: '접수 마감 임박', description: '마감 3일 전과 하루 전에 알려드려요.', enabled: true },
  { title: '당첨자 발표', description: '관심 청약의 발표일을 알려드려요.', enabled: false },
];

export function NotificationsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="NOTIFICATION" title="알림 설정" description="필요한 소식만 골라서 받아보세요." />
      <View style={styles.summary}><Text style={styles.summaryNumber}>2</Text><View><Text style={styles.summaryTitle}>알림이 켜져 있어요</Text><Text style={styles.summaryText}>새로운 청약 소식을 놓치지 않도록 준비했어요.</Text></View></View>
      <Text style={styles.sectionTitle}>알림 종류</Text>
      {alerts.map((alert) => <View key={alert.title} style={styles.row}><View style={styles.copy}><Text style={styles.title}>{alert.title}</Text><Text style={styles.description}>{alert.description}</Text></View><Switch value={alert.enabled} onValueChange={() => undefined} trackColor={{ false: '#dedede', true: '#f4b083' }} thumbColor={alert.enabled ? colors.orange : '#fff'} /></View>)}
      <Pressable style={styles.locationButton}><Text style={styles.locationIcon}>＋</Text><View><Text style={styles.locationTitle}>관심 지역 추가</Text><Text style={styles.locationText}>지역별 맞춤 알림을 받아보세요.</Text></View><Text style={styles.arrow}>›</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, backgroundColor: colors.background, flexGrow: 1 },
  summary: { backgroundColor: colors.orange, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  summaryNumber: { color: colors.surface, fontSize: 44, fontWeight: '800', marginRight: 16 },
  summaryTitle: { color: colors.surface, fontSize: 16, fontWeight: '800', marginBottom: 5 },
  summaryText: { color: colors.surface, fontSize: 12, opacity: 0.85 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginBottom: 12 },
  row: { ...shadow, backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  copy: { flex: 1, paddingRight: 12 },
  title: { color: colors.ink, fontSize: 14, fontWeight: '700', marginBottom: 5 },
  description: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  locationButton: { ...shadow, backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  locationIcon: { color: colors.orange, fontSize: 25, marginRight: 12 },
  locationTitle: { color: colors.ink, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  locationText: { color: colors.muted, fontSize: 12 },
  arrow: { color: colors.muted, fontSize: 25, marginLeft: 'auto' },
});
