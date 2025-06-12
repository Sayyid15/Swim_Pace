import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { useRouter } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
            const user = userCredential.user;

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                setError("Gebruiker bestaat niet in Firestore.");
                return;
            }

            const role = userDoc.data()?.role;

            if (!role) {
                setError("Geen rol toegekend. Neem contact op met de beheerder.");
                return;
            }

            if (role === 'coach') {
                router.replace('/(coach)/(tabs)/home');
            } else if (role === 'swimmer') {
                router.replace('/(swimmer)/(tabs)/home');
            } else {
                setError("Ongeldige rol. Neem contact op met de beheerder.");
            }

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/images/swimPace.png')} style={styles.logo} />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholderTextColor="#999"
                secureTextEntry
            />
            {error !== '' && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.link} onPress={() => router.push('/(auth)/register')}>
                {"Don't have an account? Register"}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A2E',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#00BFFF',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    link: {
        marginTop: 20,
        color: '#2196F3',
        textAlign: 'center',
        fontSize: 14,
    },
});
