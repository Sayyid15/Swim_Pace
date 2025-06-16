import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
 View, TextInput, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
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
            const { uid } = userCredential.user;

            const swimmerDoc = await getDoc(doc(db, 'swimmers', uid));
            if (swimmerDoc.exists() && swimmerDoc.data()?.role === 'swimmer') {
                return router.replace('/(swimmer)');
            }

            const coachDoc = await getDoc(doc(db, 'coaches', uid));
            if (coachDoc.exists() && coachDoc.data()?.role === 'coach') {
                return router.replace('/(coach)');
            }

            setError('Geen geldige rol gevonden.');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.container}>
                        <Image source={require('../../assets/images/swimPace.png')} style={styles.logo} />
                        <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#999" />
                        <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#999" />
                        {!!error && <Text style={styles.error}>{error}</Text>}
                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>
                        <Text style={styles.link} onPress={() => router.push('/(auth)/swimmerRegister')}>Register as Swimmer</Text>
                        <Text style={styles.link} onPress={() => router.push('/(auth)/coachRegister')}>Register as Coach</Text>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A2E',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 220,
        height: 220,
        marginBottom: 30,
        resizeMode: 'contain',
    },
    input: {
        width: '100%',
        backgroundColor: '#FFF',
        padding: 14,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#00BFFF',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 10,
        width: '100%',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16,
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
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#1A1A2E',
    },

});
