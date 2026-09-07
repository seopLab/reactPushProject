import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, shadow } from '../theme';

const menu = ['관심 지역 관리', '청약 조건 관리', '알림 시간 설정', '서비스 이용 안내'];

export function ProfileScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="MY PAGE" title="마이페이지" description="나에게 맞는 청약 정보를 관리해요." />
      <View style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>지</Text></View><View><Text style={styles.name}>지성님</Text><Text style={styles.email}>맞춤 청약 설정을 시작해보세요.</Text></View><Text style={styles.arrow}>›</Text></View>
      <Text style={styles.sectionTitle}>맞춤 설정</Text>
      <View style={styles.menu}>{menu.map((item) => <Pressable key={item} style={styles.menuItem}><Text style={styles.menuText}>{item}</Text><Text style={styles.arrow}>›</Text></Pressable>)}</View>
      <View style={styles.version}><Text style={styles.versionLabel}>청약소식</Text><Text style={styles.versionText}>버전 1.0.0</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, backgroundColor: colors.background, flexGrow: 1 },
  profile: { ...shadow, backgroundColor: colors.surface, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.peach, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  avatarText: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  name: { color: colors.ink, fontSize: 16, fontWeight: '800', marginBottom: 5 },
  email: { color: colors.muted, fontSize: 12 },
  arrow: { color: colors.muted, fontSize: 25, marginLeft: 'auto' },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginBottom: 12 },
  menu: { ...shadow, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16 },
  menuItem: { minHeight: 54, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center' },
  menuText: { color: colors.ink, fontSize: 14 },
  version: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28, paddingHorizontal: 4 },
  versionLabel: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  versionText: { color: colors.muted, fontSize: 12 },
});
