import WeatherScreen from "../src/screens/WeatherScreen"; // Correct import
import { View } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1 }}>
      <WeatherScreen />
    </View>
  );
}
