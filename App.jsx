import React, { useEffect, useState, useRef } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import Map from './Map';
import LocationDenied from './LocationDenied';
import Loading from './Loading';

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
        <Loading />
      ) : locationPermission === 'granted' ? (
        <Map />
      ) : (
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
});