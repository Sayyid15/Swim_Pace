import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/config/firebase';
import { Heat } from "@/.expo/types/screens";

export default function SwimmerHome() {
    const [stats, setStats] = useState<Heat[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            const q = query(collection(db, 'heats'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);

            const data: Heat[] = querySnapshot.docs.map(doc => {
                const raw = doc.data();
                return {
                    id: doc.id,
                    date: raw.date,
                    timestamp: raw.timestamp,
                    swimmers: raw.swimmers || [],
                };
            });

            const filtered = data.map(heat => {
                const swimmerEntries = heat.swimmers.filter((entry) => {
                    const matchEmail = entry.email?.toLowerCase().trim() === user.email?.toLowerCase().trim();
                    const matchName = entry.name?.toLowerCase().trim() === user.displayName?.toLowerCase().trim();
                    return matchEmail || matchName;
                });

                return swimmerEntries.length > 0
                    ? { ...heat, swimmers: swimmerEntries }
                    : null;
            }).filter(Boolean) as Heat[];

            setStats(filtered);
        };

        fetchStats();
    }, []);

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Most recent stats</Text>
            <FlatList
                data={stats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() =>
                            router.push({
                                pathname: '/(swimmer)/stats/[id]',
                                params: { id: item.id },
                            })
                        }
                    >
                        <Text style={styles.itemText}>Stats {formatDate(item.date)}</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1A2E', padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#fff' },
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
