import { Manrope_700Bold, Manrope_800ExtraBold, useFonts } from '@expo-google-fonts/manrope';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppShell } from '@/components/layout/AppShell';
import { AuthProvider } from '@/contexts/AuthContext';
import { colors } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Manrope_700Bold, Manrope_800ExtraBold });

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppShell>
          <Slot />
        </AppShell>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
