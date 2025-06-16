import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, FlatList, Alert } from 'react-native';
import { Button, Chip, Menu, Provider } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, getDocs, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

const Swimming = () => {
    const router = useRouter();

    const [swimmers, setSwimmers] = useState<string[]>([]);
    const distances = ['15 m', '25 m', '50 m', '100 m', '200 m'];
    const strokes = ['Butterfly', 'Backstroke', 'Breaststroke', 'Freestyle'];

    const [showSwimmersMenu, setShowSwimmersMenu] = useState(false);
    const [showDistanceMenu, setShowDistanceMenu] = useState(false);
    const [showStrokeMenu, setShowStrokeMenu] = useState<string | null>(null);
    const [selectedSwimmers, setSelectedSwimmers] = useState<string[]>([]);
    const [selectedDistance, setSelectedDistance] = useState<string | null>(null);
    const [swimmerStrokes, setSwimmerStrokes] = useState<Record<string, string>>({});
    const [presets, setPresets] = useState<any[]>([]);

    // ✅ fetchPresets moved out of useFocusEffect
    const fetchPresets = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'heatPresets'));
            const results: any[] = [];
            querySnapshot.forEach((doc) => {
                results.push({ id: doc.id, ...doc.data() });
            });
            results.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds); // newest first
            setPresets(results);
        } catch (error) {
            console.error('Error fetching presets:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const fetchSwimmers = async () => {
                try {
                    const querySnapshot = await getDocs(collection(db, 'swimmers'));
                    const names: string[] = [];
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.name) names.push(data.name);
                    });
                    setSwimmers(names);
                } catch (error) {
                    console.error('Error fetching swimmers:', error);
                }
            };

            setSelectedSwimmers([]);
            setSelectedDistance(null);
            setSwimmerStrokes({});
            fetchSwimmers();
            fetchPresets();
        }, [])
    );

    const toggleSwimmer = (swimmer: string) => {
        setSelectedSwimmers((prev) =>
            prev.includes(swimmer) ? prev.filter((s) => s !== swimmer) : [...prev, swimmer]
        );
    };

    const selectStroke = (swimmer: string, stroke: string) => {
        setSwimmerStrokes((prev) => ({ ...prev, [swimmer]: stroke }));
        setShowStrokeMenu(null);
    };

    const savePreset = async () => {
        try {
            await addDoc(collection(db, 'heatPresets'), {
                distance: selectedDistance,
                swimmers: selectedSwimmers,
                strokes: swimmerStrokes,
                timestamp: Timestamp.now(),
            });
            Alert.alert('Saved', 'Heat preset saved successfully!');
            setSelectedSwimmers([]);
            setSelectedDistance(null);
            setSwimmerStrokes({});

            await fetchPresets(); // ✅ refresh presets after save
        } catch (error) {
            console.error('Error saving preset:', error);
            Alert.alert('Error', 'Failed to save heat preset.');
        }
    };

    const loadPreset = async (preset: any) => {
        setSelectedSwimmers(preset.swimmers);
        setSelectedDistance(preset.distance);
        setSwimmerStrokes(preset.strokes);

        try {
            await deleteDoc(doc(db, 'heatPresets', preset.id));
            setPresets((prev) => prev.filter((p) => p.id !== preset.id));
        } catch (error) {
            console.error('Error deleting preset:', error);
        }
    };

    return (
        <Provider>
            <View style={styles.container}>
                <View style={styles.buttonRow}>
                    <View style={{ flex: 1 }}>
                        <Menu
                            visible={showSwimmersMenu}
                            onDismiss={() => setShowSwimmersMenu(false)}
                            anchor={
                                <Button
                                    onPress={() => setShowSwimmersMenu(true)}
                                    style={styles.button}
                                    labelStyle={styles.buttonLabel}
                                >
                                    Select Swimmers
                                </Button>
                            }
                        >
                            {swimmers.map((swimmer) => (
                                <Menu.Item
                                    key={swimmer}
                                    onPress={() => {
                                        toggleSwimmer(swimmer);
                                        setShowSwimmersMenu(false);
                                    }}
                                    title={swimmer}
                                />
                            ))}
                        </Menu>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Menu
                            visible={showDistanceMenu}
                            onDismiss={() => setShowDistanceMenu(false)}
                            anchor={
                                <Button
                                    onPress={() => setShowDistanceMenu(true)}
                                    style={styles.button}
                                    labelStyle={styles.buttonLabel}
                                >
                                    Select Distance
                                </Button>
                            }
                        >
                            {distances.map((distance) => (
                                <Menu.Item
                                    key={distance}
                                    onPress={() => {
                                        setSelectedDistance(distance);
                                        setShowDistanceMenu(false);
                                    }}
                                    title={distance}
                                />
                            ))}
                        </Menu>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.header}>Selected Swimmers</Text>
                    {selectedSwimmers.length > 0 ? (
                        <FlatList
                            data={selectedSwimmers}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <View style={styles.swimmerRow}>
                                    <View style={styles.column}>
                                        <Chip style={styles.chip}>{item}</Chip>
                                    </View>
                                    <View style={styles.column}>
                                        <Menu
                                            visible={showStrokeMenu === item}
                                            onDismiss={() => setShowStrokeMenu(null)}
                                            anchor={
                                                <Button
                                                    mode="outlined"
                                                    onPress={() => setShowStrokeMenu(item)}
                                                    style={styles.strokeButton}
                                                    labelStyle={styles.strokeButtonLabel}
                                                >
                                                    {swimmerStrokes[item] || 'Select Stroke'}
                                                </Button>
                                            }
                                            contentStyle={styles.menuContent}
                                        >
                                            {strokes.map((stroke) => (
                                                <Menu.Item
                                                    key={stroke}
                                                    onPress={() => selectStroke(item, stroke)}
                                                    title={stroke}
                                                />
                                            ))}
                                        </Menu>
                                    </View>
                                </View>
                            )}
                        />
                    ) : (
                        <Text style={styles.emptyText}>No swimmers selected</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.header}>Selected Distance</Text>
                    {selectedDistance ? (
                        <Chip style={styles.chip}>{selectedDistance}</Chip>
                    ) : (
                        <Text style={styles.emptyText}>No distance selected</Text>
                    )}
                </View>

                <Button
                    mode="contained"
                    style={styles.startButton}
                    disabled={selectedSwimmers.length === 0 || !selectedDistance}
                    onPress={() => {
                        router.push({
                            pathname: '/heat',
                            params: {
                                swimmers: encodeURIComponent(JSON.stringify(selectedSwimmers)),
                                distance: selectedDistance ?? '',
                                strokes: encodeURIComponent(JSON.stringify(swimmerStrokes)),
                            },
                        });
                    }}
                >
                    Start Heat
                </Button>

                <Button
                    mode="contained"
                    style={styles.presetButton}
                    disabled={selectedSwimmers.length === 0 || !selectedDistance}
                    onPress={savePreset}
                >
                    Save as Heat Preset
                </Button>

                <View style={styles.section}>
                    <Text style={styles.header}>Presets</Text>
                    {presets.length > 0 ? (
                        presets.map((preset) => (
                            <Button
                                key={preset.id}
                                mode="outlined"
                                style={{ marginBottom: 8 }}
                                onPress={() => loadPreset(preset)}
                            >
                                {preset.distance} - {preset.swimmers.join(', ')}
                            </Button>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No presets saved</Text>
                    )}
                </View>
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#1A1A2E',
    },
    buttonRow: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: '#2196F3',
        marginHorizontal: 2,
        height: 45,
        justifyContent: 'center',
        borderRadius: 8,
    },
    buttonLabel: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    section: {
        marginVertical: 16,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#FFFFFF',
    },
    swimmerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    column: {
        flex: 1,
    },
    chip: {
        backgroundColor: '#2196F3',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    strokeButton: {
        borderColor: '#2196F3',
        height: 40,
        justifyContent: 'center',
        borderRadius: 8,
    },
    strokeButtonLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'center',
    },
    menuContent: {
        borderRadius: 8,
    },
    emptyText: {
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
    startButton: {
        marginTop: 20,
        backgroundColor: '#4CAF50',
        height: 45,
        justifyContent: 'center',
    },
    presetButton: {
        marginTop: 12,
        backgroundColor: '#FF9800',
        height: 45,
        justifyContent: 'center',
    },
});

export default Swimming;
