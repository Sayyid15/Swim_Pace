import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import {Provider} from "react-native-paper";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
      <Provider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack>
          {/* Auth flow */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />

          {/* Coach tab flow */}
          <Stack.Screen name="(coach)" options={{ headerShown: false }} />

          {/* Swimmer tab flow */}
          <Stack.Screen name="(swimmer)" options={{ headerShown: false }} />

          {/* Optional fallback */}
          <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
        </Stack>

      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
      </Provider>
  );
}
