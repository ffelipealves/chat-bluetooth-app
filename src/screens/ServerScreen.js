import { View, Text, Button, StyleSheet, Alert } from 'react-native';

export default function ServerScreen({ navigation }){
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Modo Servidor</Text>

            <View style={styles.buttonContainer}>
            <Button title="Teste" onPress={() => console.log("clicado")} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Ir para chat" onPress={() => navigation.navigate('Chat')} />
            </View>
    
        </View>
      );
}


const styles = StyleSheet.create({
    container: {
      flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
    },
    title: {
      fontSize: 24, marginBottom: 40,
    },
    buttonContainer: {
      marginVertical: 10, width: '80%',
    },
  });