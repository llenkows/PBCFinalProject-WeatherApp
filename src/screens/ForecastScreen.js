import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import axios from "axios";

const ForecastScreen = ({ latitude, longitude }) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Validate coordinates
      if (isNaN(latitude)) throw new Error("Invalid latitude");
      if (isNaN(longitude)) throw new Error("Invalid longitude");
      if (latitude < -90 || latitude > 90) throw new Error("Latitude out of range");
      if (longitude < -180 || longitude > 180) throw new Error("Longitude out of range");

      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast`, {
          params: {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
            timezone: "auto",
            forecast_days: 5
          },
          timeout: 10000
        }
      );

      if (!response.data?.daily) {
        throw new Error("Invalid data format from API");
      }
      
      setForecast(response.data.daily);
    } catch (err) {
      console.error("Forecast fetch error:", err);
      setError(err.message || "Failed to load forecast");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [latitude, longitude]);

  const handleRetry = () => {
    fetchForecast();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>5-Day Forecast</Text>

      {loading && (
        <>
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {forecast && !loading && !error && (
        <View>
          {forecast.time.map((date, index) => (
            <View key={date} style={styles.forecastItem}>
              <Text style={styles.date}>{new Date(date).toLocaleDateString()}</Text>
              <Text style={styles.temp}>
                🌡️ {forecast.temperature_2m_min[index]}°C - {forecast.temperature_2m_max[index]}°C
              </Text>
              <Text style={styles.precip}>
                ☔ Precipitation: {forecast.precipitation_sum[index]} mm
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#4A90E2" 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "white", 
    marginBottom: 20,
    textAlign: "center"
  },
  forecastItem: { 
    backgroundColor: "rgba(255, 255, 255, 0.2)", 
    padding: 15,
    borderRadius: 10, 
    marginVertical: 8, 
    width: "100%"
  },
  date: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "white",
    marginBottom: 5
  },
  temp: { 
    fontSize: 16, 
    color: "white",
    marginVertical: 3
  },
  precip: { 
    fontSize: 16, 
    color: "white",
    marginVertical: 3
  },
  loadingText: {
    color: "white",
    textAlign: "center",
    marginTop: 10
  },
  errorContainer: {
    marginTop: 20,
    alignItems: "center"
  },
  error: { 
    color: "#FF5733",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15
  },
  retryButton: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 5,
    width: 120
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  }
});

export default ForecastScreen;