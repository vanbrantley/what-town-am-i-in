import React, { useEffect, useState, useRef } from 'react';
import { AppState, StyleSheet, View, Text } from 'react-native';
import Map from './Map';
import LocationDenied from './LocationDenied';
import * as Location from 'expo-location';

export default function App() {

  const appState = useRef(AppState.currentState);
  const [locationPermission, setLocationPermission] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAndRequestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status);
    setLoading(false);
  };

  useEffect(() => {

    const handleAppStateChange = (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        checkAndRequestPermission();
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    // Initial check and request permission
    checkAndRequestPermission();

    return () => {
      subscription.remove();
    };

  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : locationPermission === 'granted' ? (
        <Map />
      ) : (
        // <LocationDenied />
        <LocationDenied onGrantPermission={checkAndRequestPermission} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 24,
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: 'bold',
  },
});