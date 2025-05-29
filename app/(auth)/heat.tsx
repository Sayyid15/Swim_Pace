import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function HeatScreen() {
    const router = useRouter();
    const { swimmers, distance, strokes } = useLocalSearchParams<{
        swimmers: string;
        distance: string;
        strokes: string;
    }>();

    const swimmerList = JSON.parse(decodeURIComponent(swimmers || '[]')) as string[];
    const strokeMap = JSON.parse(decodeURIComponent(strokes || '{}')) as Record<string, string>;
    const selectedDistance = distance || '--';

    const [elapsedMs, setElapsedMs] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [finishTimes, setFinishTimes] = useState<Record<string, string>>({});
    const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

    const intervalRef = useRef<NodeJS.Timer | null>(null);

    useFocusEffect(
        useCallback(() => {
            setElapsedMs(0);
            setIsRunning(false);
            setFinishTimes({});
            setFeedbackMap({});
        }, [])
    );

    useEffect(() => {
        if (isRunning) {
            const start = Date.now() - elapsedMs;
            intervalRef.current = setInterval(() => {
                setElapsedMs(Date.now() - start);
            }, 10);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const formatTime = (ms: number): string => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(minutes)}:${pad(seconds)},${pad(centiseconds)}`;
    };

    const handleSwimmerClick = (swimmer: string) => {
        if (finishTimes[swimmer]) return;

        const time = formatTime(elapsedMs);
        const updatedTimes = { ...finishTimes, [swimmer]: time };
        setFinishTimes(updatedTimes);

        if (Object.keys(updatedTimes).length === swimmerList.length) {
            setIsRunning(false);
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setElapsedMs(0);
        setFinishTimes({});
        setFeedbackMap({});
    };

    const handleSaveHeatWithFeedback = async () => {
        try {
            const swimmersWithDetails = swimmerList.map((name) => ({
                name,
                stroke: strokeMap[name],
                time: finishTimes[name] || null,
                feedback: feedbackMap[name] || '',
            }));

            const now = new Date();
            await addDoc(collection(db, 'heats'), {
                distance: selectedDistance,
                timestamp: Timestamp.now(),
                date: now.toISOString(),
                swimmers: swimmersWithDetails,
            });

            alert('Heat saved with feedback!');
            router.push('/swimming');
        } catch (error) {
            console.error('Error saving heat:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Button icon="arrow-left" onPress={() => router.back()} style={{ marginTop: 40 }}>
                Go back
            </Button>

            <Text style={styles.header}>{formatTime(elapsedMs)}</Text>

            <View style={styles.buttonRow}>
                <Button icon="reload" mode="contained" onPress={handleReset} style={styles.reset}>
                    Reset
                </Button>
                <Button
                    icon={isRunning ? 'pause' : 'play'}
                    mode="contained"
                    onPress={() => setIsRunning(!isRunning)}
                    style={styles.start}
                >
                    {isRunning ? 'Pause' : 'Start'}
                </Button>
            </View>

            <Text style={styles.subHeader}>Swimmers ({selectedDistance})</Text>

            <FlatList
                data={swimmerList}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <View style={styles.swimmerItem}>
                        <TouchableOpacity onPress={() => handleSwimmerClick(item)}>
                            <View style={styles.swimmerRow}>
                                <Text style={styles.swimmerName}>{item}</Text>
                                <Text style={styles.stroke}>{strokeMap[item]}</Text>
                                <Text style={styles.time}>{finishTimes[item] || '--:--,--'}</Text>
                            </View>
                        </TouchableOpacity>

                        {finishTimes[item] && (
                            <TextInput
                                value={feedbackMap[item] || ''}
                                onChangeText={(text) =>
                                    setFeedbackMap((prev) => ({ ...prev, [item]: text }))
                                }
                                placeholder="Enter feedback..."
                                placeholderTextColor="#888"
                                style={styles.feedbackInput}
                            />
                        )}
                    </View>
                )}
            />

            <Button
                mode="contained"
                style={{ backgroundColor: '#4CAF50', marginBottom: 80, marginTop: 20 }}
                onPress={handleSaveHeatWithFeedback}
            >
                Save & Next Heat
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#1A1A2E' },
    header: { fontSize: 36, textAlign: 'center', fontWeight: 'bold', marginBottom: 20, color: '#FFFFFF' },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 20,
    },
    subHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#FFFFFF' },
    swimmerItem: {
        backgroundColor: '#e0f7fa',
        borderRadius: 8,
        marginVertical: 6,
        padding: 10,
    },
    swimmerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    swimmerName: { fontSize: 18, fontWeight: 'bold', flex: 1 },
    stroke: { fontSize: 16, flex: 1, textAlign: 'center' },
    time: { fontSize: 18, flex: 1, textAlign: 'right' },
    feedbackInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 8,
        marginTop: 10,
        fontSize: 14,
    },
    reset: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: "#2196F3",
        color: '#FFFFFF'
    },
    start: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#2196F3',
        color: '#FFFFFF'
    },
});
