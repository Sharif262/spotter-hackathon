import { NativeModules, Platform } from 'react-native';

/** True when VisionCamera’s native module is in this binary (not Expo Go). */
export function isNativePoseRuntime() {
  if (Platform.OS === 'web') return false;
  return NativeModules.CameraView != null;
}
