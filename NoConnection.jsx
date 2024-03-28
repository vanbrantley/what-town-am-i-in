import { View, StyleSheet, Text } from 'react-native';

const NoConnection = () => {

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.noConnectionText}>Looks like there's a problem with your internet connection</Text>
                <Text style={styles.noConnectionText}>Connect to find out what town you're in</Text>
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
    noConnectionText: {
        fontSize: 24,
        color: 'rgba(0, 0, 0, 0.5)',
        fontWeight: 'bold',
        marginBottom: 16,
    },
});

export default NoConnection;