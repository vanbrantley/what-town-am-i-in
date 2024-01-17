import { View, Text, StyleSheet } from 'react-native';

const TownSign = (props) => {

    const { townName } = props;

    return (
        <View style={styles.townContainer}>
            <Text style={styles.townText} numberOfLines={2}>{townName}</Text>
        </View>
    );

};

const styles = StyleSheet.create({
    townContainer: {
        backgroundColor: '#08820a',
        position: 'absolute',
        alignSelf: 'center',
        flex: 1,
        top: 100,
        width: 250,
        height: 100,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    townText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
        flex: 1
    },
});

export default TownSign;