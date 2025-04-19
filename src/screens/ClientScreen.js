import { View, Text, Button, StyleSheet, Alert } from 'react-native';

export default function ClientScreen(){
    return (
        <View style={styles.container}>
          <Text style={styles.title}>Modo Cliente</Text>
             
          <View style={styles.buttonContainer}>
            <Button title="teste" onPress={() => console.log("clicado")} />
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