import RNFS from 'react-native-fs';
import { Alert } from 'react-native';

export const saveBase64ToVideoFile = async (base64Video) => {
  try {
    const filePath = `${RNFS.TemporaryDirectoryPath}video_temp_${Date.now()}.mp4`;
    await RNFS.writeFile(filePath, base64Video, 'base64');
    console.log('🎥 Vídeo salvo em:', filePath);
    return filePath;
  } catch (err) {
    console.error('❌ Erro ao salvar o vídeo:', err);
    Alert.alert('Erro', 'Ocorreu um erro ao tentar salvar o vídeo.');
    return null;
  }
};

