import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  PermissionsAndroid,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

export default function ClientScreen({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [pairedDevices, setPairedDevices] = useState([]);
  const [discovering, setDiscovering] = useState(false);
  const [pairedDevice, setPairedDevice] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    loadPairedDevices(); // Carrega os pareados ao iniciar
  }, []);

  const requestLocationPermission = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permissão de localização',
        message: 'Necessário para descobrir dispositivos Bluetooth próximos.',
        buttonNeutral: 'Pergunte-me depois',
        buttonNegative: 'Cancelar',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const loadPairedDevices = async () => {
    try {
      const bonded = await RNBluetoothClassic.getBondedDevices();
      setPairedDevices(bonded);
    } catch (error) {
      console.error('Erro ao carregar dispositivos pareados:', error);
      Alert.alert('Erro', 'Não foi possível obter os dispositivos pareados.');
    }
  };

  const startDiscovery = async () => {
    const permissionGranted = await requestLocationPermission();
    if (!permissionGranted) {
      alert('Permissão de localização negada');
      return;
    }
    setDiscovering(true);
    try {
      const unpairedDevices = await RNBluetoothClassic.startDiscovery();
      setDevices(unpairedDevices);
    } catch (error) {
      console.error('Erro ao iniciar descoberta:', error);
    } finally {
      setDiscovering(false);
    }
  };

  const cancelDiscovery = async () => {
    try {
      const cancelled = await RNBluetoothClassic.cancelDiscovery();
      if (cancelled) {
        Alert.alert('Cancelado', 'Busca por dispositivos cancelada.');
        setDiscovering(false);
      }
    } catch (error) {
      console.error('Erro ao cancelar descoberta:', error);
      Alert.alert('Erro', 'Não foi possível cancelar a busca.');
    }
  };

  const pairWithDevice = async (address) => {
    try {
      const device = await RNBluetoothClassic.pairDevice(address);
      setPairedDevice(device);
      Alert.alert('Pareado com sucesso', `${device.name || device.address}`);
      loadPairedDevices(); // Atualiza a lista de pareados
    } catch (error) {
      console.error('Erro ao parear:', error);
      Alert.alert('Erro', 'Falha ao parear o dispositivo');
    }
  };

  const connectToDevice = async (device) => {
    try {
      const alreadyConnected = await device.isConnected();
      if (!alreadyConnected) {
        await device.connect({
          CONNECTOR_TYPE: 'rfcomm',
          DELIMITER: '\n',
          DEVICE_CHARSET: Platform.OS === 'ios' ? 1536 : 'utf-8',
        });
      }
      setConnected(true);
      setPairedDevice(device);
      Alert.alert('Conectado', `Conectado com: ${device.name || device.address}`);
      navigation.navigate('Chat')
    } catch (error) {
      console.error('Erro ao conectar:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao dispositivo.');
    }
  };

  const renderDeviceItem = ({ item }, isPaired = false) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => isPaired ? connectToDevice(item) : pairWithDevice(item.address)}
    >
      <Text style={styles.deviceName}>{item.name || 'Sem nome'}</Text>
      <Text style={styles.deviceAddress}>{item.address}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cliente - Dispositivos Bluetooth</Text>

      <Button title="Buscar dispositivos" onPress={startDiscovery} disabled={discovering} />

      {discovering && (
        <View style={styles.cancelButton}>
          <Button title="Cancelar busca" onPress={cancelDiscovery} color="red" />
        </View>
      )}

      <Text style={styles.subtitle}>Dispositivos Descobertos</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.address}
        renderItem={(item) => renderDeviceItem(item, false)}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum dispositivo encontrado.</Text>}
        style={styles.deviceList}
      />

      <Text style={styles.subtitle}>Dispositivos Pareados</Text>
      <FlatList
        data={pairedDevices}
        keyExtractor={(item) => item.address}
        renderItem={(item) => renderDeviceItem(item, true)}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum dispositivo pareado.</Text>}
        style={styles.deviceList}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20 },
  deviceList: { marginTop: 10 },
  deviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deviceName: { fontSize: 16, fontWeight: 'bold' },
  deviceAddress: { fontSize: 14, color: '#666' },
  emptyText: { textAlign: 'center', marginTop: 10, color: '#999' },
  cancelButton: { marginTop: 10 },
});
