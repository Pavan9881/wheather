import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ImageBackground, Text, View, StyleSheet } from 'react-native';

const Splash = () => {

    const navigation = useNavigation()
    useEffect(() => {
        const timer = setTimeout(() => {
          navigation.navigate('Home');
        }, 3000);
        return () => clearTimeout(timer);
      }, []);
  return (
    <ImageBackground 
      source={require('../Asstes/Images/wheather.jpg')} 
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.text}>Welcome</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  text: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default Splash;
