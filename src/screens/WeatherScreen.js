import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import axios from "axios";

const WeatherScreen = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied.");
        setLoading(false);
        return;
      }

      // Get user's location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Get weather data
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&precipitation=true`
      );

      setWeather(weatherResponse.data.current_weather);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError("Could not retrieve weather. Check your internet connection.");
    }

    setLoading(false);
  };

  const convertToFahrenheit = (celsius) => (celsius * 9) / 5 + 32;

  const getPrecipitationStatus = (precipitation) => {
    if (precipitation > 0) {
      return precipitation > 1 ? "Snowing ❄️" : "Raining 🌧️";
    }
    return "No Precipitation ☀️";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather App</Text>

      <TouchableOpacity style={styles.button} onPress={getLocationAndWeather}>
        <Text style={styles.buttonText}>Refresh Weather</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {weather && !loading && (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherText}>🌡️ Temperature: {convertToFahrenheit(weather.temperature).toFixed(1)}°F</Text>
          <Text style={styles.weatherText}>💨 Wind Speed: {weather.windspeed} km/h</Text>
          <Text style={styles.weatherText}>{getPrecipitationStatus(weather.precipitation)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4A90E2",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FFA500",
    padding: 12,
    borderRadius: 8,
    width: "60%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  weatherContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    width: "80%",
  },
  weatherText: {
    fontSize: 18,
    color: "white",
    marginVertical: 5,
  },
  error: {
    marginTop: 10,
    fontSize: 16,
    color: "#FF5733",
  },
});

export default WeatherScreen;
