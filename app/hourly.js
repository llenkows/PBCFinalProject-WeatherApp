import { useLocalSearchParams } from 'expo-router';
import HourlyForecastScreen from '../src/screens/HourlyForecastScreen';

export default function ForecastWrapper() {
  const params = useLocalSearchParams();
  
  // Convert string parameters to numbers
  const numericParams = {
    latitude: parseFloat(params.latitude),
    longitude: parseFloat(params.longitude)
  };

  return <HourlyForecastScreen {...numericParams} />;
}