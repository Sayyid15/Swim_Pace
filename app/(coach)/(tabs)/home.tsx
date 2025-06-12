import { Text, StyleSheet, View, Image, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";


export default function Home() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.home}>
            <Image
                source={require("../../../assets/images/swimPace.png")}
                style={styles.logo}
            />

            <Text style={styles.text}>Welcome To SwimPace Coach </Text>

            <TouchableOpacity
                style={styles.startButton}
                onPress={() => router.push("/swimming")}
                activeOpacity={0.8}
            >
                <Text style={styles.startButtonText}>Get Started</Text>
            </TouchableOpacity>


        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    home: {
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
    text: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    startButton: {
        backgroundColor: '#00BFFF',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    }
});
