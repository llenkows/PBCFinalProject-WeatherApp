import { useRouter } from 'expo-router';
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import axios from "axios";

export default function WeatherScreen() {
  const router = useRouter();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);

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
      setUserLocation(location);
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

  const convertToMPH = (kmph) => (kmph * (0.621371));

  const getWindChillStatus = (temperature, windspeed) => {
    return (35.74) + (0.6215)*(temperature) - (35.75)*(windspeed**0.16) + (0.4275)*(temperature)*(windspeed**0.16)
  }

  const getPrecipitationStatus = (precipitation) => {
    if (precipitation > 1) {
      return "❄️ Snowing";
    } else if (precipitation > 0) {
      return "🌧️ Raining";
    }
    return "☀️ No Precipitation";
  };

  const getRecommendation = (temperature, windspeed, precipitation) => {
    if (temperature < 50) {
      return "🥶 It's cold! Wear a jacket.";
    } else if (temperature > 85) {
      return "🔥 It's hot! Stay hydrated.";
    } else if (windspeed > 15) {
      return "💨 It's windy! Secure loose items.";
    } else if (precipitation > 0) {
      return "🌧️ Bring an umbrella!";
    } else {
      return "😎 Enjoy the nice weather!";
    }
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
          <Text style={styles.weatherText}>💨 Wind Speed: {convertToMPH(weather.windspeed).toFixed(1)} MPH</Text>
          <Text style={styles.weatherText}>🧮 Real Feel Temp.: {getWindChillStatus(convertToFahrenheit(weather.temperature).toFixed(1), convertToMPH(weather.windspeed)).toFixed(1)}°F</Text>
          <Text style={styles.weatherText}>{getPrecipitationStatus(weather.precipitation)}</Text>
          <View style={styles.recommendationContainer}>
            <Text style={styles.recommendation}>👉 {getRecommendation(convertToFahrenheit(weather.temperature), weather.windspeed, weather.precipitation)}</Text>
          </View>
        </View>
      )}
      
      {userLocation && (
      <View style={styles.forecastButtonRow}>
        <TouchableOpacity
          style={[styles.button, styles.smallButton]}
          onPress={() => router.push({
            pathname: '/forecast',
            params: {
              latitude: userLocation.coords.latitude.toString(),
              longitude: userLocation.coords.longitude.toString()
            }
          })}
        >
          <Text style={styles.buttonText}>5-Day</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.smallButton]}
          onPress={() => router.push({
            pathname: '/hourly',
            params: {
              latitude: userLocation.coords.latitude.toString(),
              longitude: userLocation.coords.longitude.toString()
            }
          })}
        >
          <Text style={styles.buttonText}>Hourly</Text>
        </TouchableOpacity>
      </View>
    )}
    </View>
  );
}

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
  recommendationContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 8,
  },
  recommendation: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
  },
  error: {
    marginTop: 10,
    fontSize: 16,
    color: "#FF5733",
  },
  forecastButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '80%',
  },
  smallButton: {
    flex: 1,
    marginHorizontal: 5,
  },  
});