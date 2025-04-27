import React from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';
import AudioPlayButton from './AudioPlayButton';

export default function MessageBubble({ message, isFromMe }) {
  return (
    <View
      style={[
        styles.messageBubble,
        isFromMe ? styles.fromMe : styles.fromOther,
      ]}
    >
      <Text style={styles.sender}>{message.sender}</Text>

      {/* Exibir mensagem de texto */}
      {message.type === 'text' && <View>
        <Text style={styles.messageText}>{message.content}</Text>
        <Button title="▶️" onPress={()=>console.log(message)}/>
        </View>}

      {/* Exibir imagem */}
      {message.type === 'audio' && (
        <View style={styles.audioContainer}>
          <Text style={styles.audioMessage}>Áudio recebido</Text>
          <AudioPlayButton message={message} />
        </View>
      )}
      {/* Exibir áudio (por enquanto só com texto explicativo, pode ser aprimorado com player de áudio) */}
      {message.type === 'audio' && <Text style={styles.audioMessage}>Áudio enviado</Text>}

      <Text style={styles.timestamp}>{message.timestamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  imageMessage: {
    width: 150,
    height: 150,
    marginTop: 5,
  },
  audioMessage: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
});
