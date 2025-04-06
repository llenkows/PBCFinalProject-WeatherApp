import { useLocalSearchParams } from 'expo-router';
import ForecastScreen from '../src/screens/ForecastScreen';

export default function ForecastWrapper() {
  const params = useLocalSearchParams();
  
  // Convert string parameters to numbers
  const numericParams = {
    latitude: parseFloat(params.latitude),
    longitude: parseFloat(params.longitude)
  };

  return <ForecastScreen {...numericParams} />;
}