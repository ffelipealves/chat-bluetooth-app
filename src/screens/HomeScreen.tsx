import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {checkFirstLaunch} from '../utils/androidPermission';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({navigation}) => {
  useEffect(() => {
    checkFirstLaunch();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha o modo:</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Atuar como Servidor"
          onPress={() => navigation.navigate('Servidor')}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Atuar como Cliente"
          onPress={() => navigation.navigate('Cliente')}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Teste" onPress={() => console.log('teste')} />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '80%',
  },
});
