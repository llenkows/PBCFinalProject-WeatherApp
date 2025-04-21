import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import axios from "axios";

const HourlyForecastScreen = ({ latitude, longitude }) => {
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHourlyForecast();
  }, []);

  const fetchHourlyForecast = async () => {
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,weathercode,windspeed_10m,uv_index&forecast_days=1&timezone=auto`
      );
      const hourly = response.data.hourly;

      const formattedData = hourly.time.map((time, index) => ({
        time,
        temperature: hourly.temperature_2m[index],
        windspeed: hourly.windspeed_10m[index],
        precipitation: hourly.precipitation[index],
        uv_index: hourly.uv_index[index],
      }));

      setHourlyData(formattedData);
    } catch (error) {
      console.error("Error fetching hourly forecast:", error);
    }
    setLoading(false);
  };

  const convertToFahrenheit = (celsius) => (celsius * 9) / 5 + 32;

  const convertToInches = (mm) => (mm / 25.4);

  const convertToMPH = (kmph) => (kmph * 0.621371);

  const getWindChillStatus = (temperature, windspeed) => {
    return (35.74) + (0.6215)*(temperature) - (35.75)*(windspeed**0.16) + (0.4275)*(temperature)*(windspeed**0.16)
  }

const renderItem = ({ item }) => {
  const tempF = convertToFahrenheit(item.temperature).toFixed(1);
  const precipIn = convertToInches(item.precipitation).toFixed(2);
  const windMPH = convertToMPH(item.windspeed).toFixed(1);
  const realFeel = getWindChillStatus(tempF, windMPH).toFixed(1);
  const uvIndex = item.uv_index ?? 'N/A';

  return (
    <View style={styles.item}>
      <Text style={styles.time}>
        {new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>
      <Text style={styles.text}>🌡️ {tempF}°F</Text>
      <Text style={styles.text}>💨 {windMPH} mph</Text>
      <Text style={styles.text}>🤒 {realFeel}°F</Text>
      <Text style={styles.text}>🌞 UV Index: {uvIndex.toFixed(0)}</Text>
      <Text style={styles.text}>🌧️ {precipIn} in</Text>
    </View>
  );
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hourly Forecast</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <FlatList
          data={hourlyData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A90E2",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  list: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    padding: 15,
    marginVertical: 6,
  },
  time: {
    fontSize: 16,
    color: "#FFD700",
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    color: "white",
  },
});

export default HourlyForecastScreen;
