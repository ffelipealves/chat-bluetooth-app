import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {useBluetoothDiscovery} from '../hooks/useBluetoothDiscovery';
import {useBluetoothConnection} from '../hooks/useBluetoothConnection';

type ClientScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Cliente'
>;

type Props = {
  navigation: ClientScreenNavigationProp;
};

const ClientScreen: React.FC<Props> = ({navigation}) => {
  const {devices, pairedDevices, discovering, startDiscovery, cancelDiscovery} =
    useBluetoothDiscovery();

  const {connectToDevice} = useBluetoothConnection();

  const handleDevicePress = async (device: any) => {
    const connectedDevice = await connectToDevice(device);
    if (connectedDevice) {
      // Conexão bem-sucedida, navega para o Chat
      navigation.navigate('Chat', {device: connectedDevice, isServer: false});
    } else {
      Alert.alert('Erro', 'Não foi possível conectar ao dispositivo.');
    }
  };

  const renderDeviceItem = ({item}: any, isPaired = false) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() =>
        isPaired ? handleDevicePress(item) : handleDevicePress(item)
      }>
      <Text style={styles.deviceName}>{item.name || 'Sem nome'}</Text>
      <Text style={styles.deviceAddress}>{item.address}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cliente - Dispositivos Bluetooth</Text>

      <Button
        title="Buscar dispositivos"
        onPress={startDiscovery}
        disabled={discovering}
      />

      {discovering && (
        <View style={styles.cancelButton}>
          <Button
            title="Cancelar busca"
            onPress={cancelDiscovery}
            color="red"
          />
        </View>
      )}

      <Text style={styles.subtitle}>Dispositivos Descobertos</Text>
      <FlatList
        data={devices}
        keyExtractor={(item: any) => item.address}
        renderItem={(item: any) => renderDeviceItem(item, false)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum dispositivo encontrado.</Text>
        }
        style={styles.deviceList}
      />

      <Text style={styles.subtitle}>Dispositivos Pareados</Text>
      <FlatList
        data={pairedDevices}
        keyExtractor={(item: any) => item.address}
        renderItem={(item: any) => renderDeviceItem(item, true)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum dispositivo pareado.</Text>
        }
        style={styles.deviceList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, paddingTop: 40},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {fontSize: 16, fontWeight: 'bold', marginTop: 20},
  deviceList: {marginTop: 10},
  deviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deviceName: {fontSize: 16, fontWeight: 'bold'},
  deviceAddress: {fontSize: 14, color: '#666'},
  emptyText: {textAlign: 'center', marginTop: 10, color: '#999'},
  cancelButton: {marginTop: 10},
});

export default ClientScreen;
