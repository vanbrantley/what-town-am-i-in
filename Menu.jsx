import { View, StyleSheet, Text } from 'react-native';

const Menu = ({ signedIn }) => {

    return (
        <View style={styles.menuContainer}>

            {signedIn ? (
                <>
                    <View style={[styles.menuItem, styles.menuItemWithBorder]}>
                        <Text style={styles.menuItemText}>History</Text>
                    </View>
                    <View style={[styles.menuItem, styles.menuItemWithBorder]}>
                        <Text style={styles.menuItemText}>Settings</Text>
                    </View>
                    <View style={styles.menuItem}>
                        <Text style={styles.menuItemText}>Sign Out</Text>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.menuItem}>
                        <Text style={styles.menuItemText}>Sign In</Text>
                    </View>
                </>
            )}

        </View>
    );

};

const styles = StyleSheet.create({
    menuContainer: {
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
    menuItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 5,
    },
    menuItemWithBorder: {
        borderBottomWidth: 2,
        borderBottomColor: '#ADB2B3',
    },
    menuItemText: {
        color: '#ADB2B3',
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
    },
});

export default Menu;