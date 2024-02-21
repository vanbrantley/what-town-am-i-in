import { View, StyleSheet, Text, TouchableOpacity, Linking } from 'react-native';

const LocationDenied = ({ onGrantPermission }) => {

    const handleOpenSettings = async () => {
        await Linking.openSettings();
        onGrantPermission();
    };

    return (
        <View style={styles.container}>
            {/* <Text style={styles.locationDeniedText}>Location Permission Denied</Text>
            <Text style={styles.locationDeniedText}>Enable Location Access in System Settings</Text>
            <Text style={styles.locationDeniedText}>Settings &gt; Privacy & Security &gt; Location Services &gt; What Town Am I In? &gt; Allow Location Access </Text> */}
            <View>
                <Text style={styles.locationDeniedText}>Location permissions are required to determine your current town</Text>
                <TouchableOpacity style={styles.settingsButton} onPress={handleOpenSettings}>
                    <Text style={styles.buttonText}>Open App Settings</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationDeniedText: {
        fontSize: 24,
        color: 'rgba(0, 0, 0, 0.5)',
        fontWeight: 'bold',
        marginBottom: 16,
    },
    settingsButton: {
        backgroundColor: '#7DCC76',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default LocationDenied;