import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { Button, Chip, Menu, Provider } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

const Swimming = () => {
    const router = useRouter();

    const [swimmers, setSwimmers] = useState<string[]>([]);
    const distances = ["15m", "25m", "50m", "100m", "200m"];
    const strokes = ["Butterfly", "Backstroke", "Breaststroke", "Freestyle"];

    const [showSwimmersMenu, setShowSwimmersMenu] = useState(false);
    const [showDistanceMenu, setShowDistanceMenu] = useState(false);
    const [showStrokeMenu, setShowStrokeMenu] = useState<string | null>(null);
    const [selectedSwimmers, setSelectedSwimmers] = useState<string[]>([]);
    const [selectedDistance, setSelectedDistance] = useState<string | null>(null);
    const [swimmerStrokes, setSwimmerStrokes] = useState<Record<string, string>>({});

    useFocusEffect(
        useCallback(() => {
            const fetchSwimmers = async () => {
                try {
                    const querySnapshot = await getDocs(collection(db, 'swimmers'));
                    const names: string[] = [];
                    querySnapshot.forEach(doc => {
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
        }, [])
    );

    const toggleSwimmer = (swimmer: string) => {
        setSelectedSwimmers(prev =>
            prev.includes(swimmer)
                ? prev.filter(s => s !== swimmer)
                : [...prev, swimmer]
        );
    };

    const selectStroke = (swimmer: string, stroke: string) => {
        setSwimmerStrokes(prev => ({ ...prev, [swimmer]: stroke }));
        setShowStrokeMenu(null);
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
                                <Button onPress={() => setShowSwimmersMenu(true)} style={styles.button} labelStyle={styles.buttonLabel}>
                                    Select Swimmers
                                </Button>
                            }
                        >
                            {swimmers.map(swimmer => (
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
                                <Button onPress={() => setShowDistanceMenu(true)} style={styles.button} labelStyle={styles.buttonLabel}>
                                    Select Distance
                                </Button>
                            }
                        >
                            {distances.map(distance => (
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
                                    <Chip style={styles.chip}>{item}</Chip>
                                    <Menu
                                        visible={showStrokeMenu === item}
                                        onDismiss={() => setShowStrokeMenu(null)}
                                        anchor={
                                            <Button
                                                mode="outlined"
                                                onPress={() => setShowStrokeMenu(item)}
                                                style={styles.strokeButton}
                                                labelStyle={{ color: '#FFFFFF' }}
                                            >
                                                {swimmerStrokes[item] || "Select Stroke"}
                                            </Button>
                                        }
                                    >
                                        {strokes.map(stroke => (
                                            <Menu.Item
                                                key={stroke}
                                                onPress={() => selectStroke(item, stroke)}
                                                title={stroke}
                                            />
                                        ))}
                                    </Menu>
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
        marginTop:40,
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
    },
    chip: {
        marginRight: 12,
        backgroundColor: '#2196F3',
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    strokeButton: {
        borderColor: '#2196F3',
        marginLeft: 10,
        height: 40,
        paddingHorizontal: 8,
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
});

export default Swimming;
