import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export type TabKey = 'home' | 'schedule' | 'favorites' | 'notifications' | 'profile';

type Tab = { key: TabKey; icon: string; label: string };

const tabs: Tab[] = [
  { key: 'home', icon: '⌂', label: '홈' },
  { key: 'schedule', icon: '▣', label: '일정' },
  { key: 'favorites', icon: '♡', label: '관심' },
  { key: 'notifications', icon: '♧', label: '알림' },
  { key: 'profile', icon: '○', label: '마이' },
];

type Props = { activeTab: TabKey; onChange: (tab: TabKey) => void };

export function BottomTabBar({ activeTab, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(tab.key)}
            style={styles.item}
          >
            <Text style={[styles.icon, active && styles.activeIcon]}>{tab.icon}</Text>
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 9,
    paddingBottom: 18,
  },
  item: { alignItems: 'center', width: 64, paddingVertical: 3 },
  icon: { color: colors.muted, fontSize: 22, lineHeight: 23 },
  activeIcon: { color: colors.orange },
  label: { color: colors.muted, fontSize: 11, marginTop: 3 },
  activeLabel: { color: colors.ink, fontWeight: '700' },
});
