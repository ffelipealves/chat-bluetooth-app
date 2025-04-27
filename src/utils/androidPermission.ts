import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

export async function requestAndroidPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, // Se necessário no seu app
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,  // Se necessário no seu app
      ]);
      

      const allGranted = Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );
      return allGranted;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
}

export async function checkFirstLaunch(): Promise<void> {
  const alreadyAsked = await AsyncStorage.getItem('bluetoothPermissionsRequested');

  if (!alreadyAsked) {
    const granted = await requestAndroidPermissions();
    
    if (granted) {
      console.log('Permissões concedidas.');
    } else {
      console.log('Permissões negadas.');
    }

    await AsyncStorage.setItem('bluetoothPermissionsRequested', 'true');
  }
}
