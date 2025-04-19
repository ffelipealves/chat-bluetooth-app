import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatScreen() {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conectado com:</Text>

      <View style={styles.deviceInfo}>
        <Text style={styles.label}>Nome:</Text>
        <Text style={styles.value}>{"device.name"}</Text>

        <Text style={styles.label}>Endereço:</Text>
        <Text style={styles.value}>{"device.address"}</Text>
      </View>

      <Text style={styles.info}>Pronto para trocar mensagens!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  deviceInfo: { marginBottom: 30 },
  label: { fontSize: 18, fontWeight: 'bold' },
  value: { fontSize: 18, marginBottom: 10 },
  info: { fontSize: 16, fontStyle: 'italic', color: 'gray' },
});