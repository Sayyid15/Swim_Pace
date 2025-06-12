import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/config/firebase';

export default function Stats() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [data, setData] = useState<any>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const docRef = doc(db, 'heats', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const heatData = docSnap.data();
                const auth = getAuth();
                const user = auth.currentUser;

                const filteredSwimmers = heatData.swimmers?.filter(
                    (entry: any) => entry.email === user?.email
                );

                setData({ ...heatData, swimmers: filteredSwimmers });
            }
        };

        fetchData();
    }, []);

    if (!data) return <Text style={styles.loading}>Loading...</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Stats {new Date(data.date).toLocaleDateString()}</Text>
            {data.swimmers.map((entry: any, index: number) => (
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
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#1A1A2E' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 , color: '#fff' },
    card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 10 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    distance: { fontWeight: 'bold' },
    time: { fontWeight: 'bold' },
    feedbackToggle: { color: '#007AFF', fontSize: 14 },
    feedback: { marginTop: 6, fontSize: 14, color: '#333' },
    loading: { marginTop: 50, textAlign: 'center', color: '#888' },
});
