import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../../App';
import {RouteProp} from '@react-navigation/native';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const {device, isServer} = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <Text style={styles.deviceInfo}>
        Dispositivo: {device.name || 'Sem nome'}
      </Text>
      <Text style={styles.deviceInfo}>
        Modo: {isServer ? 'Servidor' : 'Cliente'}
      </Text>
      {/* Aqui você pode adicionar o conteúdo do chat */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
  },
  deviceInfo: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default ChatScreen;
