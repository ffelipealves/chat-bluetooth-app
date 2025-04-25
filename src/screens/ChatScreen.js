import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';


export default function ChatScreen({ route }) {
  const navigation = useNavigation();
  const { device, isServer } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const screenIsActive = useRef(true); 
  const [readSubscription, setReadSubscription] = useState(null);
  const [disconnectSubscription, setDisconnectSubscription] = useState(null);
  const flatListRef = useRef(null);
  const audioRecorderPlayerRef = useRef(new AudioRecorderPlayer());

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioPath, setRecordedAudioPath] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentAudioPath, setCurrentAudioPath] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);


  const formatTimestamp = () => {
    const now = new Date();
    return `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };
  
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

  const saveMessages = async () => {
    try {
      await AsyncStorage.setItem(`chat_${device.address}`, JSON.stringify(messages));
    } catch (err) {
      console.warn('Erro ao salvar mensagens:', err);
    }
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

  const toggleRecording = async () => {
    const player = audioRecorderPlayerRef.current;

    if (!isRecording) {
      try {
        const result = await player.startRecorder(`${RNFS.DocumentDirectoryPath}/gravado.aac`);
        setRecordedAudioPath(result);
        setIsRecording(true);
      } catch (error) {
        console.error('Erro ao iniciar gravação:', error);
      }
    } else {
      try {
        await player.stopRecorder();
        setIsRecording(false);
      } catch (error) {
        console.error('Erro ao parar gravação:', error);
      }
    }
  };

  const sendAudio = async () => {
    const player = audioRecorderPlayerRef.current;
  
    try {
      if (!recordedAudioPath) {
        console.warn('Caminho do áudio gravado está vazio.');
        return;
      }
  
      console.log('Caminho do áudio gravado:', recordedAudioPath);
  
      const fileData = await RNFS.readFile(recordedAudioPath, 'base64');
      console.log('Tamanho do Base64 antes do envio:', fileData.length);
      console.log('Trecho inicial do Base64:', fileData.substring(0, 100)); // apenas os primeiros caracteres
  
      const audioMessage = {
        id: Date.now().toString(),
        type: 'audio',
        base64: fileData,
        sender: isServer ? 'Servidor' : 'Cliente',
        timestamp: formatTimestamp(),
      };
  
      await device.write(JSON.stringify(audioMessage) + '\n', 'utf-8');
      console.log('✅ Áudio enviado com sucesso via Bluetooth');
  
      setMessages((prev) => [...prev, audioMessage]);
    } catch (error) {
      console.error('❌ Erro ao enviar áudio:', error);
    } finally {
      await player.stopRecorder();
      setIsRecording(false);
      setRecordedAudioPath(null);
    }
  };
  
  const openAudioPlayer = async (base64, timestamp) => {

};

  const sendImage = async () => {
    Alert.alert(
      'Enviar imagem',
      'Escolha uma opção',
      [
        {
          text: 'Câmera',
          onPress: async () => {
            const result = await launchCamera({
              mediaType: 'photo',
              includeBase64: true,
              maxWidth: 800,
              maxHeight: 800,
              quality: 0.7,
            });
  
            if (result.didCancel || !result.assets || !result.assets[0].base64) return;
  
            const imageBase64 = result.assets[0].base64;
  
            const imageMessage = {
              id: Date.now().toString(),
              sender: isServer ? 'Servidor' : 'Cliente',
              type: 'image',
              data: imageBase64,
              timestamp: formatTimestamp(),
            };
  
            try {
              await device.write(JSON.stringify(imageMessage) + '\n', 'utf-8');
              setMessages((prev) => [...prev, imageMessage]);
            } catch (err) {
              console.warn('Erro ao enviar imagem:', err);
            }
          },
        },
        {
          text: 'Galeria',
          onPress: async () => {
            const result = await launchImageLibrary({
              mediaType: 'photo',
              includeBase64: true,
              maxWidth: 800,
              maxHeight: 800,
              quality: 0.7,
            });
  
            if (result.didCancel || !result.assets || !result.assets[0].base64) return;
  
            const imageBase64 = result.assets[0].base64;
  
            const imageMessage = {
              id: Date.now().toString(),
              sender: isServer ? 'Servidor' : 'Cliente',
              type: 'image',
              data: imageBase64,
              timestamp: formatTimestamp(),
            };
  
            try {
              await device.write(JSON.stringify(imageMessage) + '\n', 'utf-8');
              setMessages((prev) => [...prev, imageMessage]);
            } catch (err) {
              console.warn('Erro ao enviar imagem:', err);
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
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
  
    const readSub = device.onDataReceived(async (event) => { // Tornando a função assíncrona
      try {
        console.log('📨 Dados recebidos via Bluetooth:', event.data); // Log bruto
  
        const data = JSON.parse(event.data.trim());
        console.log('✅ JSON parseado:', data); // Log do objeto parseado
  
        const receivedMessage = {
          id: Date.now().toString(),
          sender: data.sender,
          type: data.type || 'text',
          text: data.text || '',
          data: data.data || '',
          base64: data.base64 || '',
          timestamp: data.timestamp,
        };
  
        if (receivedMessage.type === 'audio') {
          console.log('📥 Áudio recebido!');
          console.log('🔍 Tamanho do Base64:', receivedMessage.base64?.length);
          console.log('🔍 Trecho inicial do Base64:', receivedMessage.base64?.substring(0, 100));
          
          const audioFilePath = `${RNFS.DocumentDirectoryPath}/audio_received_${data.timestamp}.aac`;
  
          // Salva o áudio recebido em um arquivo local
          try {
            await RNFS.writeFile(audioFilePath, receivedMessage.base64, 'base64');
            console.log('✅ Áudio salvo com sucesso no caminho:', audioFilePath);
          } catch (error) {
            console.error('❌ Erro ao salvar áudio recebido:', error);
          }
        }
  
        setMessages((prev) => [...prev, receivedMessage]);
      } catch (e) {
        console.error('❌ Erro ao processar mensagem recebida:', e);
        console.log('❗ Conteúdo bruto com erro:', event.data);
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
              screenIsActive.current = false;
              await disconnect();
              navigation.dispatch(e.data.action);
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

      {item.type === 'image' ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.data}` }}
          style={{ width: 200, height: 200, borderRadius: 10 }}
        />
      ) : item.type === 'audio' ? (
        <TouchableOpacity onPress={() => openAudioPlayer(item.base64, item.timestamp)}>
          <Text style={{ color: 'blue' }}>▶️ Ouvir áudio</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.messageText}>{item.text}</Text>
      )}

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
        <TouchableOpacity style={styles.iconButton} onPress={toggleRecording}>
          <Text style={styles.buttonText}>{isRecording ? '⏹️' : '🎤'}</Text>
        </TouchableOpacity>

        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder={isRecording ? 'Gravando...' : 'Digite uma mensagem'}
          style={[styles.input, isRecording && { backgroundColor: '#f0f0f0' }]}
          editable={!isRecording}
        />

        <TouchableOpacity style={styles.iconButton} onPress={sendImage} disabled={isRecording}>
          <Text style={styles.iconText}>📷</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={isRecording ? sendAudio : sendMessage}
          disabled={isRecording && !recordedAudioPath}
        >
          <Text style={styles.sendText}>{isRecording ? '🎙️' : '🚀'}</Text>
        </TouchableOpacity>
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
  iconButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  sendText: {
    fontSize: 20,
    color: '#fff',
  },
});
