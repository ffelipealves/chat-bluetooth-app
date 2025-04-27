import { useState, useRef } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

export default function useAudioRecorder() {
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  const [isRecording, setIsRecording] = useState(false);
  const [tempAudioPath, setTempAudioPath] = useState(null);

  const startRecording = async () => {
    const tempPath = `${RNFS.TemporaryDirectoryPath}audio_temp.m4a`;
    setTempAudioPath(tempPath);
    await audioRecorderPlayer.startRecorder(tempPath);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
  };

  const getAudioBase64 = async () => {
    if (!tempAudioPath) return null;
    setIsRecording(false);
    //console.log('Base64 gerado:', base64Audio.slice(0, 100)); // log só um pedaço pra não travar console
    ///console.log(`data:audio/m4a;base64,${base64Audio.slice(0, 100)}...`);
    return await RNFS.readFile(tempAudioPath, 'base64');
  };

  const resetRecording = () => {
    setTempAudioPath(null);
    setIsRecording(false);
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    getAudioBase64,
    resetRecording,
  };
}
