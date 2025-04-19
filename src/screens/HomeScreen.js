import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

export default function HomeScreen({ navigation }) {


  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    const alreadyAsked = await AsyncStorage.getItem('bluetoothPermissionsRequested');
    if (!alreadyAsked) {
      const granted = await requestBluetoothPermissions();
      if (granted) {
        console.log('Permissões concedidas.');
      } else {
        console.log('Permissões negadas.');
      }

      await AsyncStorage.setItem('bluetoothPermissionsRequested', 'true');
    }
  };

  async function requestBluetoothPermissions() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        ]);
  
        const allGranted = Object.values(granted).every(p => p === PermissionsAndroid.RESULTS.GRANTED);
        return allGranted;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha o modo:</Text>

      <View style={styles.buttonContainer}>
        <Button title="Atuar como Servidor" onPress={() => navigation.navigate('Servidor')} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Atuar como Cliente" onPress={() => navigation.navigate('Cliente')} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Teste" onPress={() => RNBluetoothClassic.openBluetoothSettings()} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  title: {
    fontSize: 24, marginBottom: 40,
  },
  buttonContainer: {
    marginVertical: 10, width: '80%',
  },
});
