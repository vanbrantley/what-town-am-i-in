import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import TownSign from './TownSign';

const Map = () => {

    const [currentLocationMarker, setCurrentLocationMarker] = useState(null);
    const [previousLocation, setPreviousLocation] = useState(null);
    // const [userPlacedMarker, setUserPlacedMarker] = useState(null);
    const [townName, setTownName] = useState(null);
    const [showTown, setShowTown] = useState(false);

    const mapViewRef = useRef(null);
    const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

    useEffect(() => {
        const updateLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.error('Location permission denied');
                    return;
                }

                const currentLocation = await Location.getCurrentPositionAsync({});
                setCurrentLocationMarker(currentLocation);
                console.log('Set location');
            } catch (error) {
                console.error('Error updating location:', error);
            }
        };

        const intervalInSeconds = 30;
        const locationUpdateInterval = setInterval(updateLocation, intervalInSeconds * 1000);

        // Initial update
        updateLocation();

        // Clean up interval on component unmount
        return () => clearInterval(locationUpdateInterval);
    }, []);

    useEffect(() => {
        if (currentLocationMarker) handleGetTown();
    }, [currentLocationMarker]);

    // useEffect(() => {
    //     if (userPlacedMarker) handleGetUserPlacedMarkerTown();
    // }, [userPlacedMarker]);

    // const handleMapPress = (coordinate) => {
    //     const userPlacedLocation = {
    //         coords: {
    //             latitude: coordinate.latitude,
    //             longitude: coordinate.longitude,
    //             altitude: null,
    //             accuracy: null,
    //             altitudeAccuracy: null,
    //             heading: null,
    //             speed: null,
    //         },
    //         timestamp: 0,
    //     };

    //     setUserPlacedMarker(userPlacedLocation);

    // };

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
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
            );

            if (response.data.results.length > 0) {
                const result = response.data.results[0];
                const addressComponents = result.address_components;

                console.log(addressComponents);

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

    // const handleGetUserPlacedMarkerTown = async () => {
    //     if (userPlacedMarker) {
    //         const town = await getTownFromCoordinates(
    //             userPlacedMarker.coords.latitude,
    //             userPlacedMarker.coords.longitude,
    //             API_KEY
    //         );

    //         // Set the town name in the state variable
    //         setTownName(town);
    //         setShowTown(true);
    //         console.log('Town Name:', town);
    //     } else {
    //         // Handle the case when userPlacedMarker is null
    //         console.warn('userPlacedMarker is null. Cannot fetch town data.');
    //     }
    // };

    return (
        <View style={styles.container}>
            {currentLocationMarker ? (
                <MapView
                    ref={mapViewRef}
                    style={styles.map}
                    // onPress={(e) => handleMapPress(e.nativeEvent.coordinate)}
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
                    {/* {userPlacedMarker && (
                        <Marker
                            coordinate={{
                                latitude: userPlacedMarker.coords.latitude,
                                longitude: userPlacedMarker.coords.longitude,
                            }}
                            pinColor="green"
                        />
                    )} */}
                </MapView>

            ) : (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            )}

            {townName && showTown && <TownSign townName={townName} />}

            {/* <TouchableOpacity
                style={styles.getUserPlacedTownButton}
                onPress={handleGetUserPlacedMarkerTown}
            >
                <Text>Placed Marker Town</Text>
            </TouchableOpacity> */}

            {currentLocationMarker && <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={centerToCurrentLocation}
            >
                <Text>Current Location</Text>
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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 24,
        color: 'rgba(0, 0, 0, 0.5)',
        fontWeight: 'bold',
    },
    currentLocationButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    getUserPlacedTownButton: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
});

export default Map;