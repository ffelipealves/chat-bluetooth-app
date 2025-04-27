import { useEffect } from 'react';
import { saveBase64AudioToFile } from '../utils/audioUtils';
import Alert from 'react-native';


export default function useBluetoothListener(device, onMessageReceived) {
  useEffect(() => {
    if (!device || typeof onMessageReceived !== 'function') return;

    const subscription = device.onDataReceived((event) => {
      try {
        const rawData = event.data.trim();

        // Tentar parsear a mensagem recebida
        const data = JSON.parse(rawData);

        // Validar campos mínimos
        if (!data.type || !data.content || !data.sender || !data.timestamp) {
          console.warn('Mensagem recebida incompleta:', data);
          return;
        }

        const message = {
          id: Date.now().toString(),
          type: data.type,
          content: data.content,
          sender: data.sender,
          timestamp: data.timestamp,
        };

        // // Se for áudio, salvar o base64 em arquivo e adicionar o path
        // if (data.type === 'audio') {
        //     const filePath = await saveBase64AudioToFile(data.content);
        //     if (filePath) {
        //         message.path = filePath;
        //     }
        // }
        //console.log(message);
        onMessageReceived(message);

      } catch (e) {
        console.error('Erro ao processar mensagem recebida:', e);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [device, onMessageReceived]);
}
