import React, { useEffect, useState, useRef } from 'react';
import { AppState, View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import TownSign from './TownSign';
import Loading from './Loading';

const Map = () => {

    const appState = useRef(AppState.currentState);
    const initialUpdateDone = useRef(false);

    const [currentLocationMarker, setCurrentLocationMarker] = useState(null);
    const [previousLocation, setPreviousLocation] = useState(null);
    const [townName, setTownName] = useState(null);
    const [showTown, setShowTown] = useState(false);

    // dev mode variables
    const enableUserPlacedPins = true;
    const disableLocationFetching = true;
    const [userPlacedPin, setuserPlacedPin] = useState(null);

    const mapViewRef = useRef(null);
    const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

    const updateLocation = async () => {
        if (!disableLocationFetching) { // don't update location if location fetching is disabled

            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.error('Location permission denied');
                    return;
                }

                const currentLocation = await Location.getCurrentPositionAsync({});
                // console.log(currentLocation);
                setCurrentLocationMarker(currentLocation);
                // console.log('Set location');
            } catch (error) {
                console.error('Error updating location:', error);
            }

        }
    };

    useEffect(() => {
        const updateLocationAndSetFlag = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    // if location fetching is disabled for dev mode, set location to hardcoded lat & lon in env file
                    if (disableLocationFetching) {
                        // match the Location.LocationObject type definition
                        const hardcodedLocation = {
                            coords: {
                                latitude: process.env.EXPO_PUBLIC_LATITUDE,
                                longitude: process.env.EXPO_PUBLIC_LONGITUDE,
                                altitude: null,
                                accuracy: null,
                                altitudeAccuracy: null,
                                heading: null,
                                speed: null,
                            },
                            timestamp: 0,
                        };

                        setCurrentLocationMarker(hardcodedLocation);
                    }
                    await updateLocation();
                    initialUpdateDone.current = true;
                }
            } catch (error) {
                console.error('Error updating location:', error);
            }
        };

        // Initial update if permission is already granted
        updateLocationAndSetFlag();

        // Set up the interval for subsequent updates
        const intervalInSeconds = 30;
        const locationUpdateInterval = setInterval(async () => {
            if (initialUpdateDone.current) {
                await updateLocation();
            }
        }, intervalInSeconds * 1000);

        // update location when app comes to the foreground
        const handleAppStateChange = async (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App has come to the foreground
                if (initialUpdateDone.current) {
                    await updateLocation();
                }
            }
            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Clean up the subscription and interval on component unmount
        return () => {
            clearInterval(locationUpdateInterval);
            subscription.remove();
        };
    }, []);

    // get town when the current location marker changes
    useEffect(() => {
        if (disableLocationFetching) {
            setTownName(process.env.EXPO_PUBLIC_TOWN_NAME);
            setShowTown(true);
        } else if (currentLocationMarker) handleGetTown();
        // if (currentLocationMarker) handleGetTown();
    }, [currentLocationMarker]);

    useEffect(() => {
        if (enableUserPlacedPins && userPlacedPin) handleGetUserPlacedPinTown();
    }, [userPlacedPin]);

    const centerToCurrentLocation = () => {
        if (currentLocationMarker && mapViewRef.current) {
            mapViewRef.current.animateToRegion({
                latitude: currentLocationMarker.coords.latitude,
                longitude: currentLocationMarker.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            });
        }
    };

    const getTownFromCoordinates = async (latitude, longitude, apiKey) => {
        try {
            console.log('requesting API...');
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
            );

            if (response.data.results.length > 0) {
                const result = response.data.results[0];
                const addressComponents = result.address_components;

                // Find the city (neighborhood / sublocality / locality) and state (administrative_area_level_1) components
                const neighborhood = addressComponents.find((component) => component.types.includes('neighborhood'))?.long_name;
                const sublocality = addressComponents.find((component) => component.types.includes('sublocality'))?.long_name;
                const locality = addressComponents.find((component) => component.types.includes('locality'))?.long_name;
                const state = addressComponents.find((component) => component.types.includes('administrative_area_level_1'))?.short_name;

                let town = "";

                if (neighborhood && sublocality) town = `${neighborhood}, ${sublocality}`;
                else if (neighborhood && locality) town = `${neighborhood}, ${locality}`;
                else if (sublocality && state) town = `${sublocality}, ${state}`;
                else if (locality && state) town = `${locality}, ${state}`;
                else town = 'Location not found';
                return town;

            } else {
                return 'Location not found';
            }
        } catch (error) {
            console.error('Error fetching location data:', error);
            return 'Error fetching location data';
        }
    };

    const toRad = (value) => {
        return (value * Math.PI) / 180;

    };

    const degreesToMeters = (degrees, radius = 6371000) => {
        return (degrees / 180) * Math.PI * radius;
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {

        // Radius of the Earth in kilometers
        const R = 6371;

        // Differences in latitudes and longitudes
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        // Haversine formula to calculate distance between two points on a sphere:
        // a = sin^2(dTheta/2) + cos(theta1) * cos(theta2) * sin^2(dLambda/2) where theta is latitude, lambda is longitutde (in radians)
        // c = 2 * atan2(sqrt(a), sqrt(1 - a))
        // d = R * c
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;

    };

    const handleGetTown = async () => {
        if (currentLocationMarker) {

            if (previousLocation) {

                const distanceInDegrees = calculateDistance(
                    previousLocation.coords.latitude,
                    previousLocation.coords.longitude,
                    currentLocationMarker.coords.latitude,
                    currentLocationMarker.coords.longitude
                );

                const distanceInMeters = degreesToMeters(distanceInDegrees);
                console.log('Calculated Distance (meters):', distanceInMeters);

                const movementThresholdMeters = 1000;

                if (distanceInMeters > movementThresholdMeters) {

                    const town = await getTownFromCoordinates(
                        currentLocationMarker.coords.latitude,
                        currentLocationMarker.coords.longitude,
                        API_KEY
                    );

                    // Set the town name in the state variable
                    setTownName(town);
                    setShowTown(true);
                    console.log('Town Name:', town);

                    setPreviousLocation(currentLocationMarker);


                } else console.log('Location change below threshold. Skipping town geolocation request.');

            }

            else {
                const town = await getTownFromCoordinates(
                    currentLocationMarker.coords.latitude,
                    currentLocationMarker.coords.longitude,
                    API_KEY
                );

                // Set the town name in the state variable
                setTownName(town);
                setShowTown(true);
                console.log('Town Name:', town);

                setPreviousLocation(currentLocationMarker);
            }

        } else {
            // Handle the case when currentLocationMarker is null
            console.warn('currentLocationMarker is null. Cannot fetch town data.');
        }
    };

    const handleGetUserPlacedPinTown = async () => {
        if (!disableLocationFetching && enableUserPlacedPins && userPlacedPin) {
            const town = await getTownFromCoordinates(
                userPlacedPin.coords.latitude,
                userPlacedPin.coords.longitude,
                API_KEY
            );

            // Set the town name in the state variable
            setTownName(town);
            setShowTown(true);
            console.log('Town Name:', town);
        }

        // else if (userPlacedPin) {
        //     // handle case when userPlacedPin is true, but enableUserPlacedPins is false
        //     console.warn('enableUserPlacedPins is currently disabled.');
        // } else {
        //     // handle case when userPlacedPin is null
        //     console.warn('userPlacedPin is null. Cannot fetch town data.');
        // }
    };

    const handleMapPress = (coordinate) => {

        // match the Location.LocationObject type definition
        const userPlacedLocation = {
            coords: {
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                altitude: null,
                accuracy: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
            },
            timestamp: 0,
        };

        setuserPlacedPin(userPlacedLocation);

    };

    const conditionallyDropUserPin = (e) => {
        if (enableUserPlacedPins) {
            handleMapPress(e.nativeEvent.coordinate);
        }
    };

    const printCurrentLocationCoords = () => {
        const latitude = currentLocationMarker.coords.latitude;
        const longitude = currentLocationMarker.coords.longitude;
        console.log('Latitude: ', latitude);
        console.log('Longitude: ', longitude);
    };

    const toggleShowMenu = () => {
        console.log('Toggle Show Menu pressed');
    };

    return (
        <View style={styles.container}>
            {currentLocationMarker ? (
                <MapView
                    ref={mapViewRef}
                    style={styles.map}
                    onPress={conditionallyDropUserPin}
                    initialRegion={{
                        latitude: currentLocationMarker.coords.latitude,
                        longitude: currentLocationMarker.coords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: currentLocationMarker.coords.latitude,
                            longitude: currentLocationMarker.coords.longitude,
                        }}
                        title="Your Location"
                        pinColor="red"
                    />
                    {enableUserPlacedPins && userPlacedPin && (
                        <Marker
                            coordinate={{
                                latitude: userPlacedPin.coords.latitude,
                                longitude: userPlacedPin.coords.longitude,
                            }}
                            pinColor="red"
                        />
                    )}
                </MapView>

            ) : (
                <Loading />
            )}

            {townName && showTown && <TownSign townName={townName} />}

            <TouchableOpacity
                style={styles.menuButton}
                onPress={toggleShowMenu}
            >
                <Image source={require('./assets/hamburger-menu.png')} style={{ width: 50, height: 50 }} />
            </TouchableOpacity>

            {currentLocationMarker && <TouchableOpacity
                style={styles.focusZoomButton}
                onPress={centerToCurrentLocation}
            >
                <Image source={require('./assets/crosshair.png')} style={{ width: 50, height: 50 }} />
            </TouchableOpacity>}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        flex: 1
    },
    focusZoomButton: {
        position: 'absolute',
        bottom: 55,
        left: 20,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    menuButton: {
        position: 'absolute',
        bottom: 55,
        right: 20,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
});

export default Map;