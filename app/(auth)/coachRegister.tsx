import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { useRouter } from 'expo-router';

export default function CoachRegister() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secretCode, setSecretCode] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        const COACH_SECRET_CODE = "JOINSWIMPACE";

        if (secretCode.trim() !== COACH_SECRET_CODE) {
            setError("Ongeldige toegangscode.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            const user = userCredential.user;

            await setDoc(doc(db, 'coaches', user.uid), {
                name: name,
                email: user.email,
                role: 'coach',
            });

            Alert.alert('Coach account aangemaakt');
            router.replace('/(coach)/(tabs)');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require("../../assets/images/swimPace.png")} style={styles.logo} />
            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor="#999"
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholderTextColor="#999"
                secureTextEntry
            />
            <TextInput
                placeholder="Secret Coach Code"
                value={secretCode}
                onChangeText={setSecretCode}
                style={styles.input}
                placeholderTextColor="#999"
                secureTextEntry
            />
            {error !== '' && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register as Coach</Text>
            </TouchableOpacity>
            <Text style={styles.link} onPress={() => router.push('/(auth)')}>
                Already have an account? Login
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
        backgroundColor: '#FF9800',
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
        fontSize: 14,
    },
});
