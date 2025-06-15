// app/(coach)/(tabs)/settings.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut, deleteUser, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useRouter } from 'expo-router';

export default function Settings() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return unsubscribe;
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/(auth)');
        } catch {
            Alert.alert('Logout Error', 'Something went wrong.');
        }
    };

    const handleDelete = async () => {
        if (user) {
            try {
                await deleteUser(user);
                Alert.alert('Deleted', 'Account removed.');
                router.replace('/(auth)/swimmerRegister');
            } catch {
                Alert.alert('Error', 'Failed to delete account.');
            }
        }
    };

    return (
        <View style={styles.container}>
            {user && (
                <View style={styles.userInfo}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user.email}</Text>
                </View>
            )}
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
            >
                <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1A1A2E',
    },
    userInfo: {
        marginTop: 60,
        marginBottom: 30,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    value: {
        color: '#FFFFFF',
        fontSize: 18,
        marginTop: 5,
    },
    button: {
        backgroundColor: '#FF3B3B',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 10,
    },
    deleteButton: {
        backgroundColor: '#777',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
