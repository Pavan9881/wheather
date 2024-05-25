import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  BackHandler,
  Alert,
} from 'react-native';
import {API_Key} from '../../Api';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import {PermissionsAndroid} from 'react-native';
import {Linking} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { useNavigation } from '@react-navigation/native';
import OfflineData from '../OfflineData/OfflineData';
const Home = () => {

  const navigation = useNavigation()
  const [lat, SetLat] = useState('');
  const [long, setLong] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);
  const [longitude, setLongitude] = useState();
  const [latitude, setLatitude] = useState();
  const [locationStatus, setLocationStatus] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log(state.type);
      console.log(state.isConnected, 'Yes I');
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to go back?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: () => BackHandler.exitApp()},
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);
  const getData = async (lat, long) => {
    setWeatherData(null);
    setDetails(null);
    if (!lat || !long) {
      alert('Please Enter Latitude and Longitude');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${API_Key}&units=metric`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setWeatherData(data.main);
      setDetails(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const Time = val => {
    const date = new Date(val * 1000);
    return date.toLocaleString();
  };

  const requestLocationPermission = async () => {
    const grantedLocation = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (!grantedLocation) {
      Alert.alert(
        'Confirm',
        'Location Permission Needs to be accepted in Settings',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {text: 'OK', onPress: () => Linking.openSettings()},
        ],
        {cancelable: false},
      );
    }
    try {
      const userResponse = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Need Location Permission',
          message: 'Please allow access to Location Permission.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (userResponse === 'granted') {
        setPermissionGranted(true);
        getCurrentLocation();
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLatitude('');
      setLongitude('');
      setLoading(true);
      Geolocation.getCurrentPosition(
        position => {
          let nLat = position.coords.latitude;
          let nLong = position.coords.longitude;
          setLoading(false);
          if (nLat === '' || nLong === '') {
            setLoading(true);
          } else {
            setLatitude(nLat);
            setLongitude(nLong);
            setLoading(false);
            getData(nLat, nLong);
          }

          Geocoder.init('AIzaSyAZXKqEGOykCzXrqXDZRIYt2vljZqDH7HQ');
          Geocoder.from(nLat, nLong)
            .then(json => {
              var addressComponent = json.results[0].address_components;
              let final_address = '';
              addressComponent.map(ad => {
                final_address = final_address + ad.long_name + ' , ';
                final_address = final_address.split(',');
              });
            })
            .catch(error => console.warn(error));
        },
        error => {
          setLocationStatus(error.message);
          getCurrentLocation();
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
        },
      );
      setLoading(false);
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <ImageBackground
      source={require('../../Asstes/Images/blue.jpg')}
      style={styles.background}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={lat}
          onChangeText={val => SetLat(val)}
          placeholderTextColor={'white'}
          placeholder="Enter Latitude"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          value={long}
          onChangeText={val => setLong(val)}
          placeholderTextColor={'white'}
          placeholder="Enter Longitude"
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.btn} onPress={() => getData(lat, long)}>
          <Text style={styles.btnText}>Search</Text>
        </TouchableOpacity>
        {!isConnected &&<TouchableOpacity
      onPress={()=>navigation.navigate('OfflineStore')}
        style={{
          backgroundColor: 'white',
          padding: 10,
          width: '70%',
          borderRadius: 12,
          alignSelf: 'center',
          marginTop: '10%',
        }}>
        <Text style={{color:"black",textAlign:'center'}}>Store Offline</Text>
      </TouchableOpacity>}
      </View>
      {!isConnected&& <OfflineData/>}
      {weatherData && (
        <Text style={{color: 'white', fontSize: 40, textAlign: 'center'}}>
          {weatherData.temp}°C
        </Text>
      )}

      {details && (
        <Text style={{alignSelf:'center'}}>Country :{details.sys.country}</Text>
      )}
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {details && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataText}>City: {details.name}</Text>
            <Text style={styles.dataText}>
              Sunrise: {Time(details.sys.sunrise)}
            </Text>
            <Text style={styles.dataText}>
              Sunset: {Time(details.sys.sunset)}
            </Text>
            <Text style={styles.dataText}>
              Wind Speed: {details.wind.speed}
            </Text>
          </View>
        )}
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {weatherData && !loading && (
          <View style={styles.weatherContainer}>
            <Text style={styles.weatherText}>
              Feels Like: {weatherData.feels_like}°C
            </Text>
            <Text style={styles.weatherText}>
              Humidity: {weatherData.humidity}%
            </Text>
            <Text style={styles.weatherText}>
              Pressure: {weatherData.pressure} hPa
            </Text>
            <Text style={styles.weatherText}>
              Temperature: {weatherData.temp}°C
            </Text>
            <Text style={styles.weatherText}>
              Max Temperature: {weatherData.temp_max}°C
            </Text>
            <Text style={styles.weatherText}>
              Min Temperature: {weatherData.temp_min}°C
            </Text>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  inputContainer: {
    alignItems: 'center',
    marginVertical: 20,
    marginTop: '10%',
  },
  input: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 15,
    width: '80%',
    height: 50,
    paddingHorizontal: 20,
    marginBottom: 20,
    color: 'white',
    fontSize: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  btn: {
    backgroundColor: '#1e90ff',
    borderRadius: 15,
    width: '60%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  weatherContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  weatherData: {
    marginBottom: 30,
  },
  weatherTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  weatherText: {
    color: 'black',
    fontSize: 18,
    marginBottom: 10,
  },
  sunData: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 15,
    marginBottom: 20,
  },
  sunTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sunText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  dataContainer: {
    padding: 20,
    margin: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginTop: 10,
  },
  dataText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginBottom: 5,
  },
});

export default Home;
