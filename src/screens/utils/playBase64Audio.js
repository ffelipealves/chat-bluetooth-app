import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
import { Alert } from 'react-native';

export const playBase64Audio = async (base64Audio) => {
  try {
    // Define a categoria de áudio (garante que funcione no modo silencioso também)
    Sound.setCategory('Playback');

    // Caminho temporário para salvar o áudio
    const filePath = `${RNFS.TemporaryDirectoryPath}audio_temp_${Date.now()}.m4a`;

    // Escreve o base64 no caminho como um arquivo
    await RNFS.writeFile(filePath, base64Audio, 'base64');

    // Inicializa o Sound usando o caminho do arquivo
    const sound = new Sound(filePath, Sound.DOCUMENT, (error) => {
      if (error) {
        console.error('Erro ao carregar áudio:', error);
        Alert.alert('Erro', 'Não foi possível carregar o áudio.');
        return;
      }

      console.log('Duração (s):', sound.getDuration(), 'Canais:', sound.getNumberOfChannels());

      // Reproduz o áudio
      sound.play((success) => {
        if (success) {
          console.log('Áudio reproduzido com sucesso');
        } else {
          console.error('Erro ao reproduzir áudio');
        }
        sound.release(); // Sempre liberar após usar
      });
    });

  } catch (err) {
    console.error('Erro geral ao preparar o áudio:', err);
    Alert.alert('Erro', 'Ocorreu um erro ao tentar tocar o áudio.');
  }
};
