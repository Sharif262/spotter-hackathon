import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { dark, light, type Theme, type ThemeName } from './theme';
import type { EquipmentKind } from './cv/exercises';
import type { ScreenId, TabId } from './types';

const TABS: TabId[] = ['home', 'sessions', 'you'];
const THEME_KEY = 'spotter-theme';

type AppContextValue = {
  screen: ScreenId;
  themeName: ThemeName;
  colors: Theme;
  curLift: string;
  curW: string;
  equipment: EquipmentKind;
  lastSessionId: number | null;
  toast: string | null;
  go: (id: ScreenId) => void;
  tab: (id: TabId) => void;
  setLift: (lift: string, w: string, equipment?: EquipmentKind) => void;
  toggleTheme: () => void;
  showToast: (msg: string) => void;
  setLastSessionId: (id: number | null) => void;
  haptic: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>('home');
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const [curLift, setCurLift] = useState('Bicep curl');
  const [curW, setCurW] = useState('12 kg');
  const [equipment, setEquipment] = useState<EquipmentKind>('db');
  const [lastSessionId, setLastSessionId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v === 'dark' || v === 'light') setThemeName(v);
    });
  }, []);

  const haptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2400);
  }, []);

  const go = useCallback(
    (id: ScreenId) => {
      haptic();
      setScreen(id);
    },
    [haptic],
  );

  const tab = useCallback(
    (id: TabId) => {
      haptic();
      setScreen(id);
    },
    [haptic],
  );

  const setLift = useCallback((lift: string, w: string, eq?: EquipmentKind) => {
    haptic();
    setCurLift(lift);
    setCurW(w);
    if (eq) setEquipment(eq);
  }, [haptic]);

  const toggleTheme = useCallback(() => {
    haptic();
    setThemeName((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
      return next;
    });
  }, [haptic]);

  const colors = themeName === 'dark' ? dark : light;

  const value = useMemo(
    () => ({
      screen,
      themeName,
      colors,
      curLift,
      curW,
      equipment,
      lastSessionId,
      toast,
      go,
      tab,
      setLift,
      toggleTheme,
      showToast,
      setLastSessionId,
      haptic,
    }),
    [
      screen, themeName, colors, curLift, curW, equipment, lastSessionId, toast,
      go, tab, setLift, toggleTheme, showToast, haptic,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function isTabScreen(id: ScreenId): id is TabId {
  return (TABS as ScreenId[]).includes(id);
}
