import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/config/firebase';

export default function Stats() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [data, setData] = useState<any>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const docRef = doc(db, 'heats', id!);
            const snap = await getDoc(docRef);
            if (!snap.exists()) return;

            const auth = getAuth();
            const user = auth.currentUser;
            const fullData = snap.data();

            const filtered = fullData.swimmers?.filter(
                (entry: any) => entry.email?.toLowerCase() === user?.email?.toLowerCase()
            );

            setData({ ...fullData, swimmers: filtered });
        };

        fetchData();
    }, [id]);

    if (!data || !data.swimmers) return <Text style={styles.loading}>Loading...</Text>;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={router.back}>
                    <Text style={styles.goBack}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Stats {new Date(data.date).toLocaleDateString()}</Text>
            </View>

            {data.swimmers.length === 0 ? (
                <Text style={styles.feedback}>Geen resultaten gevonden</Text>
            ) : (
                data.swimmers.map((entry: any, index: number) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.headerRow}>
                            <Text style={styles.distance}>{data.distance} {entry.stroke}</Text>
                            <Text style={styles.time}>{entry.time}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setExpandedIndex(index === expandedIndex ? null : index)}>
                            <Text style={styles.feedbackToggle}>Feedback {expandedIndex === index ? '▲' : '▼'}</Text>
                        </TouchableOpacity>
                        {expandedIndex === index && (
                            <Text style={styles.feedback}>{entry.feedback || 'No feedback provided'}</Text>
                        )}
                    </View>
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#1A1A2E' },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    goBack: { color: '#007AFF', fontSize: 16 ,marginTop:35},
    title: { fontSize: 20, fontWeight: 'bold', color: '#fff' ,marginTop:35},
    card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 10, marginTop:10 },
    distance: { fontWeight: 'bold' },
    time: { fontWeight: 'bold' },
    feedbackToggle: { color: '#007AFF', fontSize: 14 },
    feedback: { marginTop: 6, fontSize: 14, color: '#333' },
    loading: { marginTop: 50, textAlign: 'center', color: '#888' },
});
