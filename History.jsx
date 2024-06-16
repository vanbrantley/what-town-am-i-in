import { View, StyleSheet, Text } from 'react-native';

const History = ({ history }) => {

    return (
        <View style={styles.historyContainer}>

            {history.map((pin, i) => {
                <View style={styles.historyItem}>
                    <Text style={styles.historyItemText}>{pin.town}</Text>
                </View>
            })}

            {/* <View style={[styles.historyItem, styles.historyItemWithBorder]}>
                <Text style={styles.historyItemText}>History</Text>
            </View>
            <View style={[styles.historyItem, styles.historyItemWithBorder]}>
                <Text style={styles.historyItemText}>Settings</Text>
            </View>
            <View style={styles.historyItem}>
                <Text style={styles.historyItemText}>Sign Out</Text>
            </View> */}

        </View>
    );

};

const styles = StyleSheet.create({
    historyContainer: {
        position: 'absolute',
        bottom: 135,
        right: 20,
        width: 200,
        height: 150,
        backgroundColor: 'white',
        // padding: 10,
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column'
    },
    historyItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 5,
    },
    historyItemWithBorder: {
        borderBottomWidth: 2,
        borderBottomColor: '#ADB2B3',
    },
    historyItemText: {
        color: '#ADB2B3',
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
    },
});

export default History;