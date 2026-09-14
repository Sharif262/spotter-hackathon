import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context';
import { TabBar } from './src/components/TabBar';
import { Toast } from './src/components/Toast';
import { HomeScreen } from './src/screens/HomeScreen';
import { SessionsScreen } from './src/screens/SessionsScreen';
import { LearnScreen } from './src/screens/LearnScreen';
import { YouScreen } from './src/screens/YouScreen';
import { PickLiftScreen } from './src/screens/PickLiftScreen';
import { FrameScreen } from './src/screens/FrameScreen';
import { RecordScreen } from './src/screens/RecordScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { FixScreen } from './src/screens/FixScreen';

function Root() {
  const { screen, colors, themeName } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={themeName === 'dark' || screen === 'frame' || screen === 'rec' ? 'light' : 'dark'} />
      {screen === 'home' && <HomeScreen />}
      {screen === 'sessions' && <SessionsScreen />}
      {screen === 'learn' && <LearnScreen />}
      {screen === 'you' && <YouScreen />}
      {screen === 'pick' && <PickLiftScreen />}
      {screen === 'frame' && <FrameScreen />}
      {screen === 'rec' && <RecordScreen />}
      {screen === 'result' && <ResultScreen />}
      {screen === 'fix' && <FixScreen />}
      <TabBar />
      <Toast />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
