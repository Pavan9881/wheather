import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, Alert, BackHandler } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';

const OfflineStore = () => {
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);

  const navigation = useNavigation(); 

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to go back?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => navigation.goBack() }, // Corrected spelling
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]); 

  let db = openDatabase({ name: 'UserDatabase.db' });

  useEffect(() => {
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_user'",
        [],
        function (tx, res) {
          console.log('item:', res.rows.length);
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS table_user', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS table_user(user_id INTEGER PRIMARY KEY AUTOINCREMENT, user_lat REAL, user_lon REAL)',
              [],
            );
          }
        },
      );
    });
  }, []);

  const saveLocation = (lat, lon) => {
    db.transaction(function (txn) {
      txn.executeSql(
        'INSERT INTO table_user (user_lat, user_lon) VALUES (?, ?)',
        [lat, lon],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            Alert.alert(
              'Success',
              'Location Stored in Offline',
              [
                {
                  text: 'Cancel',
                  onPress: () => null,
                  style: 'cancel',
                },
                {
                  text: 'YES',
                  onPress: () => navigation.goBack(),
                },
              ],
              { cancelable: false } 
            );
          } else {
            console.log('Failed to save location');
          }
        },
      );
    });
  };

  console.log(lat, long, 'this is offline data');
  return (
    <ImageBackground 
      style={{ flex: 1, width: '100%', height: '100%', resizeMode: 'cover' }}
      source={require('../../Asstes/Images/blue.jpg')}
    >
      <TextInput
        placeholder="Latitude"
        placeholderTextColor={'white'}
        keyboardType='numeric'
        value={lat}
        onChangeText={(val) => setLat(val)}
        style={{
          borderWidth: 1,
          borderColor: 'white',
          width: '80%',
          borderRadius: 11,
          alignSelf: 'center',
          marginTop: '10%',
          color: 'white'
        }}
      />
      <TextInput
        placeholder="Longitude"
        placeholderTextColor={'white'}
        keyboardType='numeric'
        value={long}
        onChangeText={(val) => setLong(val)}
        style={{
          borderWidth: 1,
          borderColor: 'white',
          width: '80%',
          borderRadius: 11,
          alignSelf: 'center',
          marginTop: '10%',
          color: 'white'
        }}
      />
      <TouchableOpacity
        onPress={() => saveLocation(lat, long)}
        style={{
          backgroundColor: 'white',
          padding: 10,
          width: '70%',
          borderRadius: 12,
          alignSelf: 'center',
          marginTop: '10%',
        }}
      >
        <Text style={{ color: "black", textAlign: 'center' }}>SAVE</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

export default OfflineStore;
