import React, {useState, useEffect} from 'react';
import { View, ImageBackground, Text, Image, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Picker } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import Axios from 'axios';

interface IBGEUFResponse{
  sigla: string
}
interface IBGECityResponse{
  nome: string
}

const Home = () => {
    const navigation = useNavigation();

    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [selectedUf, setSelectedUf] = useState('');
    const [selectedCity, setSelectedCity] = useState('0');
    

    function handleNavigateToPoints(){
        navigation.navigate('Points', {
          selectedUf,
          selectedCity
        });
    }

    useEffect(() => {
      Axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then( response => {
        const ufInitials = response.data.map(uf => uf.sigla);
        setUfs(ufInitials);
      });
    }, []);

    useEffect( () => {
      // carregar as cidades sempre que a uf mudar
      if (selectedUf === '0'){
          return;
      }

      Axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
          .then( response => {
              const cityNames = response.data.map(city => city.nome);

              setCities(cityNames);
          });

    }, [selectedUf]);

    return (
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ImageBackground 
            source={require('../../assets/home-background.png')} 
            style={styles.container}
            imageStyle={{
                width: 274,
                height: 368
            }}
        >
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')} />
                <View>
                  <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                  <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</Text>
                </View>
            </View>

            <View style={styles.footer}>
              
              <Picker
                selectedValue={selectedUf} 
                onValueChange={(pickerSelectedUf) => {
                  setSelectedUf(pickerSelectedUf)
                }}
              >
                <Picker.Item label="Escolha a UF" value="0" />
                { ufs.map( uf => (
                  <Picker.Item key={uf} label={uf} value={uf} />
                ) ) }
                
              </Picker>

              <Picker
                selectedValue={selectedCity} 
                onValueChange={(pickerSelectedCity) => {
                  setSelectedCity(pickerSelectedCity)
                }}
              >
                <Picker.Item label="Escolha a Cidade" value="0" />
                { cities.map( city => (
                  <Picker.Item key={city} label={city} value={city} />
                ) ) }
                
              </Picker>

                <RectButton style={styles.button} onPress={() => {
                  if(selectedCity === '0'){
                    alert('Hey, selecione uma cidade');
                  } else {
                    handleNavigateToPoints()
                  }
                }}>
                    <View style={styles.buttonIcon}>
                        <Text>
                            <Icon name="arrow-right" color="#FFF" size={24} />
                        </Text>
                    </View>
                <Text style={styles.buttonText}>Entrar</Text>
                </RectButton>
            </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    )
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });

export default Home;