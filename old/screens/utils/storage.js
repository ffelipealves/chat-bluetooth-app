import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'chat_messages_';

export const saveMessages = async (key, messages) => {
  try {
    await AsyncStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(messages));
  } catch (e) {
    console.error('Erro ao salvar mensagens:', e);
  }
};

export const loadMessages = async (key) => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_PREFIX + key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Erro ao carregar mensagens:', e);
    return [];
  }
};
