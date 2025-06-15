import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut, deleteUser, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useRouter } from "expo-router";

const Settings = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace("/(auth)");
        } catch (error) {
            Alert.alert("Logout Error", "Something went wrong.");
        }
    };

    const handleDeleteAccount = async () => {
        if (user) {
            try {
                await deleteUser(user);
                Alert.alert("Account Deleted", "Your account has been removed.");
                router.replace("/(auth)/swimmerRegister");
            } catch (error) {
                Alert.alert("Delete Error", "Could not delete account.");
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

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
            >
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.logoutButton, { marginTop: 10, backgroundColor: '#999' }]}
                onPress={handleDeleteAccount}
                activeOpacity={0.8}
            >
                <Text style={styles.logoutButtonText}>Delete Account</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor:'#1A1A2E'

    },

    userInfo: {
        marginBottom: 30,

    },
    label: {
        marginTop:60,
        fontSize: 16,
        color:'#ffffff',
        fontWeight:"bold"

    },
    value: {
        fontSize: 18,
        marginTop: 5,
        color:'#ffffff'

    },
    logoutButton: {
        backgroundColor: '#FF3B3B',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default Settings;
