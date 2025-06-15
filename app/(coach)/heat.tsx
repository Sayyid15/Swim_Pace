import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function HeatScreen() {
    const router = useRouter();
    const { swimmers, distance, strokes } = useLocalSearchParams();
    const swimmerList: string[] = JSON.parse(decodeURIComponent(Array.isArray(swimmers) ? swimmers[0] : swimmers || '[]'));
    const strokeMap: Record<string, string> = JSON.parse(decodeURIComponent(Array.isArray(strokes) ? strokes[0] : strokes || '{}'));

    const selectedDistance = distance || '--';

    const [elapsedMs, setElapsedMs] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState<string[]>([]);
    const [lapAssignments, setLapAssignments] = useState<Record<number, string[]>>({});
    const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
    const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});
    const [swimmerEmails, setSwimmerEmails] = useState<Record<string, string>>({});

    const intervalRef = useRef<number | null>(null); // ✅ FIXED TYPE

    useEffect(() => {
        const fetchSwimmerEmails = async () => {
            const snapshot = await getDocs(collection(db, 'swimmers'));
            const map: Record<string, string> = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.name && data.email) {
                    map[data.name] = data.email;
                }
            });
            setSwimmerEmails(map);
        };
        fetchSwimmerEmails();
    }, []);

    useEffect(() => {
        if (isRunning) {
            const start = Date.now() - elapsedMs;
            intervalRef.current = window.setInterval(() => setElapsedMs(Date.now() - start), 10); // ✅ FIXED
        } else if (intervalRef.current !== null) {
            clearInterval(intervalRef.current); // ✅ FIXED
        }
        return () => {
            if (intervalRef.current !== null) clearInterval(intervalRef.current); // ✅ FIXED
        };
    }, [isRunning]);
    const formatTime = (ms: number): string => {
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        const cs = Math.floor((ms % 1000) / 10);
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')},${cs.toString().padStart(2, '0')}`;
    };

    const handleLap = () => setLaps(prev => [...prev, formatTime(elapsedMs)]);
    const handleReset = () => {
        setIsRunning(false);
        setElapsedMs(0);
        setLaps([]);
        setLapAssignments({});
        setFeedbacks({});
        setOpenDropdowns({});
    };

    const handleSaveHeat = async () => {
        const swimmersWithDetails: any[] = [];

        laps.forEach((time, index) => {
            (lapAssignments[index] || []).forEach((name) => {
                const email = swimmerEmails[name];
                if (!email) return;
                swimmersWithDetails.push({
                    name,
                    email,
                    stroke: strokeMap[name] || '',
                    time,
                    feedback: feedbacks[`${index}-${name}`] || '',
                });
            });
        });

        if (!swimmersWithDetails.length) {
            Alert.alert('Geen gegevens', 'Geen valide zwemmers gevonden met e-mailadres.');
            return;
        }

        try {
            await addDoc(collection(db, 'heats'), {
                distance: selectedDistance,
                timestamp: Timestamp.now(),
                date: new Date().toISOString(),
                swimmers: swimmersWithDetails,
            });
            Alert.alert('Opgeslagen', 'Heat succesvol opgeslagen!');
            router.push('/swimming');
        } catch (err) {
            Alert.alert('Fout', 'Heat kon niet worden opgeslagen.');
        }
    };

    return (
        <View style={styles.container}>
            <Button icon="arrow-left" onPress={() => router.back()} style={styles.backButton}>
                Terug
            </Button>

            <Text style={styles.timer}>{formatTime(elapsedMs)}</Text>

            <View style={styles.controls}>
                <Button mode="contained" onPress={() => setIsRunning(!isRunning)} style={styles.start}>
                    {isRunning ? 'Stop' : 'Start'}
                </Button>
                <Button mode="contained" onPress={handleLap} disabled={!isRunning}>
                    Lap
                </Button>
                <Button mode="contained" onPress={handleReset}>
                    Reset
                </Button>
            </View>

            <Text style={styles.header}>Tijden & Zwemmers</Text>

            <FlatList
                data={laps}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.lapBlock}>
                        <Text style={styles.lapText}>Lap {index + 1} - {item}</Text>

                        <DropDownPicker
                            open={openDropdowns[index] || false}
                            value={lapAssignments[index] || []}
                            items={swimmerList.map((s: string) => ({ label: s, value: s }))}
                            setOpen={(value) => {
                                setOpenDropdowns((prev) => ({
                                    ...prev,
                                    [index]: typeof value === 'function' ? value(prev[index] ?? false) : value,
                                }));
                            }}
                            setValue={(cb) => {
                                const val = cb(lapAssignments[index] || []);
                                setLapAssignments(prev => ({ ...prev, [index]: val }));
                            }}
                            multiple
                            placeholder="Selecteer zwemmers"
                            style={{ marginBottom: 10 }}
                        />


                        {(lapAssignments[index] || []).map((name) => (
                            <View key={name} style={styles.feedbackRow}>
                                <Text style={styles.name}>{name}</Text>
                                <TextInput
                                    placeholder="Feedback"
                                    placeholderTextColor="#888"
                                    style={styles.input}
                                    value={feedbacks[`${index}-${name}`] || ''}
                                    onChangeText={(text) =>
                                        setFeedbacks(prev => ({ ...prev, [`${index}-${name}`]: text }))
                                    }
                                />
                            </View>
                        ))}
                    </View>
                )}
            />

            <Button mode="contained" style={styles.save} onPress={handleSaveHeat}>
                Save Heat
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1A2E', padding: 20 },
    backButton: { marginTop: 40 },
    timer: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        marginVertical: 30,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
    },
    start: { backgroundColor: '#4CAF50' },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 10,
    },
    lapBlock: {
        backgroundColor: '#e0f7fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    lapText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    feedbackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: { flex: 1, fontSize: 16 },
    input: {
        flex: 2,
        marginLeft: 8,
        fontSize: 14,
        backgroundColor: '#FFF',
        borderRadius: 6,
        padding: 6,
    },
    save: {
        marginTop: 30,
        backgroundColor: '#4CAF50',
    },
});
