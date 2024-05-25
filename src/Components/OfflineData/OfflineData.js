import React, {useState, useEffect} from 'react';
import {FlatList, Text, View} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
const OfflineData = () => {
  var db = openDatabase({name: 'UserDatabase.db'});
  let [data, setData] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM table_user', [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i)
          temp.push(results.rows.item(i));
        setData(temp);
      });
    });
  }, []);
  console.log(data);
  return (
    <View style={{}}>
      <Text
        style={{
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: 20,
          color: 'white',
        }}>
        Offline Stored Location
      </Text>
      <FlatList
        data={data}
        renderItem={({item}) => {
          return (
            <View
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: 'white',
                width: '80%',
                marginTop: 10,
                alignSelf: 'center',
                borderRadius: 10,
              }}>
              <Text style={{textAlign: 'center', fontSize: 20}}>
                Latitude:{item.user_lat}
              </Text>

              <Text style={{textAlign: 'center', fontSize: 20}}>
                Longitude:{item.user_lon}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

export default OfflineData;
