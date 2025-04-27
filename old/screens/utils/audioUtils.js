import RNFS from 'react-native-fs';

export const saveBase64AudioToFile = async (base64Data) => {
  try {
    const path = `${RNFS.DocumentDirectoryPath}/received_audio_${Date.now()}.m4a`;

    await RNFS.writeFile(path, base64Data, 'base64');
    return path;
  } catch (error) {
    console.error('Erro ao salvar áudio base64:', error);
    return null;
  }
};
