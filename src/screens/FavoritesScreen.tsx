import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, shadow } from '../theme';

const projects = [
  { title: '힐스테이트 광교', location: '경기 수원시', status: '특별공급', dday: 'D-5', color: colors.peach },
  { title: '센트럴 푸르지오', location: '서울 성동구', status: '1순위', dday: 'D-5', color: colors.mint },
  { title: '래미안 메가시티 자이', location: '서울 강남구', status: '2순위', dday: 'D-2', color: '#f7c3a3' },
];

export function FavoritesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="MY PICKS" title="관심 청약" description="저장한 공고의 일정과 마감일을 놓치지 마세요." />
      <View style={styles.notice}><Text style={styles.noticeIcon}>♡</Text><View style={styles.noticeCopy}><Text style={styles.noticeTitle}>관심 조건을 먼저 설정해보세요</Text><Text style={styles.noticeText}>나에게 맞는 청약을 더 빠르게 찾을 수 있어요.</Text></View><Text style={styles.arrow}>›</Text></View>
      <Text style={styles.sectionTitle}>저장한 공고 3개</Text>
      {projects.map((project) => <Pressable key={project.title} style={[styles.card, { backgroundColor: project.color }]}><View style={styles.cardTop}><Text style={styles.status}>{project.status}</Text><Text style={styles.heart}>♥</Text></View><Text style={styles.title}>{project.title}</Text><Text style={styles.location}>{project.location}</Text><Text style={styles.dday}>{project.dday}</Text></Pressable>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, backgroundColor: colors.background, flexGrow: 1 },
  notice: { ...shadow, backgroundColor: colors.surface, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  noticeIcon: { color: colors.orange, fontSize: 28, marginRight: 12 },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: colors.ink, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  noticeText: { color: colors.muted, fontSize: 12 },
  arrow: { color: colors.muted, fontSize: 25 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginBottom: 12 },
  card: { borderRadius: 20, padding: 17, minHeight: 142, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  status: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  heart: { color: '#f26f5c', fontSize: 18 },
  title: { color: colors.ink, fontSize: 19, fontWeight: '800', marginBottom: 6 },
  location: { color: '#555', fontSize: 12 },
  dday: { color: colors.ink, fontSize: 13, fontWeight: '800', position: 'absolute', right: 17, bottom: 17 },
});
