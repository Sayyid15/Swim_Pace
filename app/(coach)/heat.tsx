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

    const swimmerList = JSON.parse(decodeURIComponent(swimmers || '[]'));
    const strokeMap = JSON.parse(decodeURIComponent(strokes || '{}'));
    const selectedDistance = distance || '--';

    const [elapsedMs, setElapsedMs] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState<string[]>([]);
    const [lapAssignments, setLapAssignments] = useState<Record<number, string[]>>({});
    const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
    const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});
    const [swimmerEmails, setSwimmerEmails] = useState<Record<string, string>>({});

    const intervalRef = useRef<NodeJS.Timer | null>(null);

    useEffect(() => {
        const fetchSwimmerEmails = async () => {
            const snapshot = await getDocs(collection(db, 'swimmers'));
            const emailMap: Record<string, string> = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.name && data.email) {
                    emailMap[data.name] = data.email;
                }
            });
            setSwimmerEmails(emailMap);
        };

        fetchSwimmerEmails();
    }, []);

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

    const handleLap = () => {
        const time = formatTime(elapsedMs);
        setLaps((prev) => [...prev, time]);
    };

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

        laps.forEach((time, lapIndex) => {
            const assignedSwimmers = lapAssignments[lapIndex] || [];
            assignedSwimmers.forEach((name) => {
                swimmersWithDetails.push({
                    name,
                    email: swimmerEmails[name] || null,
                    stroke: strokeMap[name] || '',
                    time,
                    feedback: feedbacks[`${lapIndex}-${name}`] || '',
                });
            });
        });

        console.log('Saving swimmersWithDetails:', swimmersWithDetails);

        if (swimmersWithDetails.length === 0) {
            Alert.alert('Geen gegevens', 'Voeg minstens één zwemmer toe aan een tijd.');
            return;
        }

        try {
            const now = new Date();
            await addDoc(collection(db, 'heats'), {
                distance: selectedDistance,
                timestamp: Timestamp.now(),
                date: now.toISOString(),
                swimmers: swimmersWithDetails,
            });

            Alert.alert('Opgeslagen', 'Heat succesvol opgeslagen!');
            router.push('/swimming');
        } catch (error) {
            console.error('Error saving heat:', error);
            Alert.alert('Fout', 'Heat kon niet worden opgeslagen.');
        }
    };

    return (
        <View style={styles.container}>
            <Button icon="arrow-left" onPress={() => router.back()} style={{ marginTop: 40 }}>
                Terug
            </Button>

            <Text style={styles.timer}>{formatTime(elapsedMs)}</Text>

            <View style={styles.controls}>
                <Button mode="contained" onPress={() => setIsRunning(!isRunning)} style={styles.startStop}>
                    {isRunning ? 'Stop' : 'Start'}
                </Button>

                <Button mode="contained" onPress={handleLap} disabled={!isRunning}>
                    Lap
                </Button>

                <Button mode="contained" onPress={handleReset}>
                    Reset
                </Button>
            </View>

            <Text style={styles.lapHeader}>Tijden & Zwemmers</Text>

            <FlatList
                data={laps}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.lapRow}>
                        <Text style={styles.lapLabel}>Lap {index + 1} - {item}</Text>

                        <DropDownPicker
                            open={openDropdowns[index] || false}
                            value={lapAssignments[index] || []}
                            items={swimmerList.map((s) => ({ label: s, value: s }))}
                            setOpen={(open) => setOpenDropdowns((prev) => ({ ...prev, [index]: open }))}
                            setValue={(callback) => {
                                const newValue = callback(lapAssignments[index] || []);
                                setLapAssignments((prev) => ({ ...prev, [index]: newValue }));
                            }}
                            multiple={true}
                            min={0}
                            max={swimmerList.length}
                            placeholder="Selecteer zwemmers"
                            style={{ marginBottom: 10 }}
                        />

                        {(lapAssignments[index] || []).map((swimmer) => (
                            <View key={swimmer} style={styles.feedbackRow}>
                                <Text style={styles.swimmerName}>{swimmer}</Text>
                                <TextInput
                                    placeholder="Feedback"
                                    placeholderTextColor="#888"
                                    style={styles.feedbackInput}
                                    value={feedbacks[`${index}-${swimmer}`] || ''}
                                    onChangeText={(text) =>
                                        setFeedbacks((prev) => ({ ...prev, [`${index}-${swimmer}`]: text }))
                                    }
                                />
                            </View>
                        ))}
                    </View>
                )}
            />

            <Button mode="contained" style={{ marginTop: 30, backgroundColor: '#4CAF50' }} onPress={handleSaveHeat}>
                Save Heat
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A2E',
        padding: 20,
    },
    timer: {
        fontSize: 48,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 30,
        color: '#FFFFFF',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
    },
    startStop: {
        backgroundColor: '#4CAF50',
    },
    lapHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    lapRow: {
        backgroundColor: '#e0f7fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    lapLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    feedbackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    swimmerName: {
        fontSize: 16,
        flex: 1,
    },
    feedbackInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        padding: 6,
        flex: 2,
        marginLeft: 8,
        fontSize: 14,
    },
});
