import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { BottomTabBar, TabKey } from './src/components/BottomTabBar';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { SignupScreen } from './src/screens/signup/SignupScreen';
import { colors } from './src/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isSignupVisible, setIsSignupVisible] = useState(false);

  if (isSignupVisible) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.signupSafeArea]}>
        <StatusBar style="dark" />
        <SignupScreen
          onClose={() => setIsSignupVisible(false)}
          onComplete={() => {
            setIsSignupVisible(false);
            setActiveTab('home');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.screen}>
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'schedule' && <ScheduleScreen />}
          {activeTab === 'favorites' && <FavoritesScreen />}
          {activeTab === 'notifications' && <NotificationsScreen />}
          {activeTab === 'profile' && <ProfileScreen onSignup={() => setIsSignupVisible(true)} />}
        </View>
        <BottomTabBar activeTab={activeTab} onChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  signupSafeArea: { backgroundColor: colors.cream },
  container: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1 },
});
