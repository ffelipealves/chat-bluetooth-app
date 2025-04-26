import React, { useRef, useState, useEffect } from 'react';
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

import useBluetoothListener from './hooks/useBluetoothListener';
import useAudioRecorder from './hooks/useAudioRecorder';
import MessageBubble from './components/MessageBubble';
import { sendMessage } from './utils/sendMessage';
import { loadMessages, saveMessages } from './utils/storage'; 


export default function ChatScreen({ route }) {
  const { device, isServer } = route.params;
  const chatKey = device?.address || 'default';
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const { isRecording, startRecording, stopRecording, getAudioBase64, resetRecording } = useAudioRecorder();
  const flatListRef = useRef(null);


  // AsyncStorage
  useEffect(() => {
    loadMessages(chatKey).then(setMessages);
  }, [chatKey]);

  useEffect(() => {
    saveMessages(chatKey, messages);
  }, [messages]);

  // Utils
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);
  
  //HOOKS
  useBluetoothListener(device, (receivedMessage) => {
    setMessages((prev) => [...prev, receivedMessage]);
  });


  //Botão de microfone:
  const handleMicPress = async () => {
    if (isRecording) {
      await stopRecording(); // apenas para de gravar
    } else {
      await startRecording();
    }
  };

  //Send
  const handleSend = async () => {
    if (isRecording) {
      console.log(audioBase64)
      await sendMessage({   device, type: 'audio', content: audioBase64,   isServer,   setMessages,   setInputText, });  
    } else {
      await sendMessage({ device, type: 'text', content: inputText.trim(), isServer, setMessages, setInputText, });
    }
  };
  
  const renderItem = ({ item }) => (
    <MessageBubble
      message={item}
      isFromMe={item.sender === (isServer ? 'Servidor' : 'Cliente')}
    />
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
      />

      <View style={styles.inputContainer}>
        <Button title={isRecording ? "Parar" : "Gravar"} onPress={handleMicPress} />
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite uma mensagem"
          style={styles.input}
        />
        <Button title="Enviar" onPress={handleSend} />
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
