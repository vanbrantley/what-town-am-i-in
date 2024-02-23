import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';

const Loading = () => {

    return (
        <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
            <ActivityIndicator size='large' color='rgba(0, 0, 0, 0.5)' style={{ marginLeft: 10 }} />
        </View>
    );

};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 32,
        color: 'rgba(0, 0, 0, 0.5)',
        fontWeight: 'bold',
    },
});

export default Loading;
