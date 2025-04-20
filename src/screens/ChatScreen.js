import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function ChatScreen({ route }) {
  const navigation = useNavigation();
  const { device, isServer } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const screenIsActive = useRef(true); 
  const [readSubscription, setReadSubscription] = useState(null);
  const [disconnectSubscription, setDisconnectSubscription] = useState(null);
  const flatListRef = useRef(null);

  const loadMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem(`chat_${device.address}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Erro ao carregar mensagens:', err);
    }
  };
  
  const formatTimestamp = () => {
    const now = new Date();
    return `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: isServer ? 'Servidor' : 'Cliente',
      timestamp: formatTimestamp(),
    };

    try {
      await device.write(JSON.stringify(newMessage) + '\n', 'utf-8');
      setMessages((prev) => [...prev, newMessage]);
      setInputText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const disconnect = async () => {
    try {
      const connected = await device?.isConnected();
      if (connected) {
        await device.disconnect();
      }
    } catch (error) {
      console.warn('Erro ao desconectar:', error.message);
    }
  };

  useEffect(() => {
    screenIsActive.current = true;

    if (!device) return;

    loadMessages();

    const readSub = device.onDataReceived((event) => {
      try {
        const data = JSON.parse(event.data.trim());
        const receivedMessage = {
          id: Date.now().toString(),
          text: data.text,
          sender: data.sender,
          timestamp: data.timestamp,
        };
        setMessages((prev) => [...prev, receivedMessage]);
      } catch (e) {
        console.error('Erro ao processar mensagem recebida:', e);
      }
    });
    setReadSubscription(readSub);

    const handleDisconnect = async () => {
      try {
        const stillConnected = await device.isConnected();
        if (stillConnected) return;
  
        if (screenIsActive.current) {
          Alert.alert('Desconectado', 'O outro dispositivo saiu do chat.', [
            {
              text: 'OK',
              onPress: () => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              },
            },
          ]);
        }
      } catch (err) {
        console.warn('Erro ao verificar conexão após desconexão:', err);
      }
    };
  
    const discSub = RNBluetoothClassic.onDeviceDisconnected(handleDisconnect);
    setDisconnectSubscription(discSub);

    return () => {
      screenIsActive.current = false;
      readSub?.remove();
      discSub?.remove();
    };
  }, [device]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    const saveMessages = async () => {
      try {
        await AsyncStorage.setItem(
          `chat_${device.address}`,
          JSON.stringify(messages)
        );
      } catch (err) {
        console.warn('Erro ao salvar mensagens:', err);
      }
    };
  
    saveMessages();
  }, [messages]);
  
  

  useFocusEffect(
    React.useCallback(() => {
      const onBeforeRemove = (e) => {
        e.preventDefault();

        Alert.alert('Sair do chat', 'Deseja desconectar e sair do chat?', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              // remove listener para evitar loop
              screenIsActive.current = false;
              await disconnect();
              navigation.dispatch(e.data.action); // agora pode sair
            },
          },
        ]);
      };

      const unsubscribe = navigation.addListener('beforeRemove', onBeforeRemove);

      return () => unsubscribe();
    }, [navigation, disconnect])
  );

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === (isServer ? 'Servidor' : 'Cliente')
          ? styles.fromMe
          : styles.fromOther,
      ]}
    >
      <Text style={styles.sender}>{item.sender}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />


      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite uma mensagem"
          style={styles.input}
        />
        <Button title="Enviar" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  chatContainer: { flexGrow: 1, justifyContent: 'flex-end' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  fromMe: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  fromOther: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  messageText: { fontSize: 16 },
  sender: {
    fontWeight: 'bold',
    marginBottom: 3,
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#555',
    marginTop: 3,
  },
});
