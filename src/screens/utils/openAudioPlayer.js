import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import { Alert } from 'react-native';

export const openAudioPlayer = async (base64Audio) => {
  try {
    Sound.setCategory('Playback');

    // 1. Salvar o base64 como MP4
    const mp4Path = `${RNFS.TemporaryDirectoryPath}audio_temp_${Date.now()}.mp4`;
    await RNFS.writeFile(mp4Path, base64Audio, 'base64');
    console.log('📂 MP4 salvo em:', mp4Path);

    // 2. Converter MP4 para M4A
    const m4aPath = mp4Path.replace('.mp4', '.m4a');
    const command = `-i "${mp4Path}" -vn -acodec aac "${m4aPath}"`;
    console.log('🎬 Convertendo para M4A...');

    await FFmpegKit.executeAsync(command, async (session) => {
      const returnCode = await session.getReturnCode();
      if (returnCode.isSuccess()) {
        console.log('✅ Conversão para M4A concluída:', m4aPath);

        // 3. Tocar o arquivo M4A
        const sound = new Sound(m4aPath, Sound.DOCUMENT, (error) => {
          if (error) {
            console.error('Erro ao carregar áudio:', error);
            Alert.alert('Erro', 'Não foi possível carregar o áudio.');
            return;
          }

          console.log('🎵 Duração (s):', sound.getDuration(), 'Canais:', sound.getNumberOfChannels());

          sound.play((success) => {
            if (success) {
              console.log('Áudio reproduzido com sucesso');
            } else {
              console.error('Erro ao reproduzir áudio');
            }
            sound.release();
          });
        });
      } else {
        console.error('❌ Falha na conversão para M4A.');
        Alert.alert('Erro', 'Falha na conversão do áudio.');
      }
    });

  } catch (err) {
    console.error('❌ Erro geral ao preparar o áudio:', err);
    Alert.alert('Erro', 'Ocorreu um erro ao tentar tocar o áudio.');
  }
};
