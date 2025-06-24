import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/config/firebase';
import { Heat } from '@/.expo/types/screens';

export default function SwimmerHome() {
    const [stats, setStats] = useState<Heat[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            const q = query(collection(db, 'heats'), orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(q);

            const results: Heat[] = snapshot.docs.map(doc => {
                const raw = doc.data();
                return {
                    id: doc.id,
                    date: raw.date,
                    timestamp: raw.timestamp,
                    distance: raw.distance,
                    swimmers: raw.swimmers || [],
                };
            }).filter((heat) =>
                heat.swimmers.some((entry: any) =>
                    entry.email?.toLowerCase() === user.email?.toLowerCase()
                )
            ).map((heat) => ({
                ...heat,
                swimmers: heat.swimmers.filter(
                    (entry: any) =>
                        entry.email?.toLowerCase() === user.email?.toLowerCase()
                )
            }));

            setStats(results);
        };

        fetchStats();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Swim Stats</Text>
            <FlatList
                data={stats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => router.push({ pathname: '/(swimmer)/stats/[id]', params: { id: item.id } })}
                    >
                        <Text style={styles.itemText}>Stats {new Date(item.date).toLocaleDateString()}</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor:'#1A1A2E'

    },
    title: { fontSize: 20, fontWeight: 'bold', marginTop: 35, color: '#fff' ,marginBottom: 10},
    item: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 6,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemText: { fontSize: 16 },
    arrow: { fontSize: 20, color: '#999' },
});