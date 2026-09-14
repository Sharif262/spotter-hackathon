import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** MediaPipe frame processors are not in Expo Go. */
export function isNativePoseRuntime() {
  if (Platform.OS === 'web') return false;
  return Constants.appOwnership !== 'expo';
}
