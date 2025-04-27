import React from 'react';
import { Button, Alert } from 'react-native';
import { playBase64Audio } from '../utils/playBase64Audio'; // ou o caminho correto

export default function AudioPlayButton({ message }) {
  const handlePlayAudio = async () => {
    if (message.type === 'audio' && message.content) {
      await playBase64Audio(message.content);
    } else {
      Alert.alert('Erro', 'Esta mensagem não contém áudio.');
    }
  };

  return (
    <Button title="▶️ Ouvir áudio" onPress={handlePlayAudio} />
  );
}
