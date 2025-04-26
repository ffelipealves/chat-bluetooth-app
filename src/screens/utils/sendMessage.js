import { formatTimestamp } from './formatTimestamp';
import Alert from 'react-native';

export const sendMessage = async ({
  device,
  type = 'text', // 'text', 'image', 'audio', etc.
  content,
  isServer,
  setMessages,
  setInputText,
}) => {
  if (!content) return;

  const newMessage = {
    id: Date.now().toString(),
    type,
    content,
    sender: isServer ? 'Servidor' : 'Cliente',
    timestamp: formatTimestamp(),
  };
  //console.log(newMessage);
  try {
    await device.write(JSON.stringify(newMessage) + '\n', 'utf-8');
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
};
