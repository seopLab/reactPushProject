import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const favoriteProjects = [
  {
    title: '힐스테이트 광교',
    info: '경기 수원시 · 특별공급',
    dDay: 'D-5',
    accent: '#f4d4a6',
    favorite: true,
  },
  {
    title: '센트럴 푸르지오',
    info: '서울 성동구 · 1순위',
    dDay: 'D-5',
    accent: '#d6e7e1',
    favorite: true,
  },
];

const scheduleItems = [
  { day: '22', weekday: '목', title: '동탄 롯데캐슬', detail: '경기 화성시 · 특별공급', active: true },
  { day: '27', weekday: '화', title: '위례 자이 엘리트', detail: '서울 송파구 · 1순위', active: false },
  { day: '31', weekday: '토', title: 'e편한마당 청라', detail: '인천 서구 · 당첨자 발표', active: false },
];

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <Text style={styles.greeting}>지성, 안녕하세요</Text>
            <Pressable style={styles.bellWrap} accessibilityLabel="알림">
              <Text style={styles.bell}>🔔</Text>
            </Pressable>
          </View>

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>서울 강남구</Text>
          </View>

          <Pressable style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <Text style={styles.heroTag}>마감 임박</Text>
              <Text style={styles.heroDday}>D-2</Text>
            </View>

            <Text style={styles.heroTitle}>래미안 메가시티 자이{'
'}청약 접수가 곧 마감돼요</Text>
            <Text style={styles.heroDate}>접수마감 8/25(화) 18:00</Text>

            <View style={styles.heroArrowWrap}>
              <Text style={styles.heroArrow}>›</Text>
            </View>
          </Pressable>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>나의 관심 청약</Text>
            <Text style={styles.sectionLink}>전체보기</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favoriteScrollContent}
            style={styles.favoriteScroll}
          >
            {favoriteProjects.map((project, index) => (
              <View
                key={index}
                style={[styles.favoriteCard, { backgroundColor: project.accent }]}
              >
                <View style={styles.favoriteCardTop}>
                  <View style={styles.favoriteHeartWrap}>
                    <Text style={styles.favoriteHeart}>{project.favorite ? '♥' : '♡'}</Text>
                  </View>
                  <Text style={styles.favoriteDday}>{project.dDay}</Text>
                </View>
                <Text style={styles.favoriteTitle}>{project.title}</Text>
                <Text style={styles.favoriteInfo}>{project.info}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>이번 달 청약 일정</Text>
          </View>

          <View style={styles.scheduleList}>
            {scheduleItems.map((item, index) => (
              <Pressable key={index} style={styles.scheduleItem}>
                <View style={[styles.dateBox, item.active && styles.dateBoxActive]}>
                  <Text style={[styles.dateDay, item.active && styles.dateDayActive]}>{item.day}</Text>
                  <Text style={[styles.dateWeekday, item.active && styles.dateWeekdayActive]}>{item.weekday}</Text>
                </View>

                <View style={styles.scheduleTextWrap}>
                  <Text style={styles.scheduleTitle}>{item.title}</Text>
                  <Text style={styles.scheduleDetail}>{item.detail}</Text>
                </View>

                <Text style={styles.scheduleArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.tabBar}>
          {[
            ['🏠', '홈'],
            ['🗓️', '일정'],
            ['📋', '관심'],
            ['🔔', '알림'],
            ['👤', '마이'],
          ].map(([emoji, label], index) => (
            <Pressable key={label} style={[styles.tabItem, index === 0 && styles.tabItemActive]}>
              <Text style={styles.tabEmoji}>{emoji}</Text>
              <Text style={[styles.tabLabel, index === 0 && styles.tabLabelActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  greeting: {
    fontSize: 25,
    fontWeight: '700',
    color: '#1d1d1d',
    lineHeight: 32,
  },
  bellWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bell: {
    fontSize: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  locationText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  heroCard: {
    backgroundColor: '#ee8e50',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    minHeight: 148,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroTag: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  heroDday: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 19,
    lineHeight: 28,
    fontWeight: '700',
    width: '72%',
  },
  heroDate: {
    color: '#fff',
    fontSize: 13,
    marginTop: 10,
    opacity: 0.9,
  },
  heroArrowWrap: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroArrow: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 28,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#222',
    fontWeight: '700',
  },
  sectionLink: {
    fontSize: 12,
    color: '#7e7e7e',
    fontWeight: '600',
  },
  favoriteScroll: {
    marginLeft: -2,
  },
  favoriteScrollContent: {
    paddingRight: 8,
  },
  favoriteCard: {
    width: 176,
    minHeight: 140,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 12,
  },
  favoriteCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  favoriteHeartWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f3f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteHeart: {
    fontSize: 15,
    color: '#ff6b5e',
  },
  favoriteDday: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e1e1e',
  },
  favoriteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 6,
  },
  favoriteInfo: {
    fontSize: 12,
    color: '#4a4a4a',
    lineHeight: 18,
  },
  scheduleList: {
    backgroundColor: 'transparent',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  dateBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateBoxActive: {
    backgroundColor: '#1d1d1d',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d1d1d',
    lineHeight: 20,
  },
  dateDayActive: {
    color: '#fff',
  },
  dateWeekday: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  dateWeekdayActive: {
    color: '#ddd',
  },
  scheduleTextWrap: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 4,
  },
  scheduleDetail: {
    fontSize: 12,
    color: '#7a7a7a',
    lineHeight: 18,
  },
  scheduleArrow: {
    fontSize: 24,
    color: '#7d7d7d',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    paddingBottom: 22,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    paddingVertical: 4,
  },
  tabItemActive: {
    opacity: 1,
  },
  tabEmoji: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 12,
    color: '#7a7a7a',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#1b1b1b',
    fontWeight: '700',
  },
});
