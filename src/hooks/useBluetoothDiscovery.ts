import { useState, useEffect } from 'react';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { Alert, Platform } from 'react-native';


export const useBluetoothDiscovery = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [pairedDevices, setPairedDevices] = useState<any[]>([]);
  const [discovering, setDiscovering] = useState(false);

  useEffect(() => {
    loadPairedDevices();
  }, []);

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

  return {
    devices,
    pairedDevices,
    discovering,
    startDiscovery,
    cancelDiscovery,
    loadPairedDevices,
  };
};
