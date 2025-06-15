import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: { position: 'absolute' },
                    default: {},
                }),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Swimming',
                    tabBarIcon: ({ color }) => <IconSymbol name="chart.bar.fill" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <IconSymbol name="gearshape.fill" size={28} color={color} />,
                }}
            />
        </Tabs>
    );
}
