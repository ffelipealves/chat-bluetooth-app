import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function ChatScreen({ route }) {
  const { device, isServer } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [readSubscription, setReadSubscription] = useState(null);

  const formatTimestamp = () => {
    const now = new Date();
    return `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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

  useEffect(() => {
    const subscription = device.onDataReceived((event) => {
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

    setReadSubscription(subscription);

    return () => {
      if (readSubscription) {
        readSubscription.remove();
      }
    };
  }, []);

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
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatContainer}
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
  sender: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageText: { fontSize: 16 },
});
