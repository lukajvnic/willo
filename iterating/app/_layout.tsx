import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '@/store/StoreContext';
import { color } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <View style={{ flex: 1, backgroundColor: color.paper }}>
          <StatusBar style="dark" />
          <Slot />
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
