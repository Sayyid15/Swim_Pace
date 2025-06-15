// app/(coach)/(tabs)/index.tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function CoachHome() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <Image source={require('../../assets/images/swimPace.png')} style={styles.logo} />
            <Text style={styles.title}>Welcome to SwimPace Coach</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/swimming')}>
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
        </SafeAreaView>
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
        width: 240,
        height: 240,
        resizeMode: 'contain',
        marginBottom: 30,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#00BFFF',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
