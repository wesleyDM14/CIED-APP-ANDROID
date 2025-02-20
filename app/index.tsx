import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal, Alert } from "react-native";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  background-color: #f4f4f4;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #1a332d;
  margin-top: 20px;
`;

const Subtitle = styled.Text`
  font-size: 18px;
  color: #6e6e6e;
  margin-bottom: 40px;
`;

const Button = styled.TouchableOpacity`
  background-color: ${(props: any) => (props.primary ? "#e2c27b" : "#1a332d")};
  padding: 15px 40px;
  border-radius: 10px;
  margin: 10px;
  width: 80%;
  align-items: center;
`;

const ButtonText = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
`;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  width: 80%;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  align-items: center;
`;

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [orientation, setOrientation] = useState();

  const printTicket = async () => {
    try {
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Erro", "Erro ao imprimir");
    }
  };

  return (
    <Container>
      {orientation ? (
        <>
          <Text>Orientation: {orientation.value}</Text>
          <Text>Lock: {orientation.lock}</Text>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
      <Image source={require('../assets/images/logo.png')} style={{ width: 150, height: 150, resizeMode: 'contain' }} />
      <Title>Atendimento</Title>
      <Subtitle>Escolha o tipo de atendimento</Subtitle>
      <Button primary onPress={() => { setSelectedType("normal"); setModalVisible(true); }}>
        <ButtonText>Atendimento Normal</ButtonText>
      </Button>
      <Button onPress={() => { setSelectedType("preferencial"); setModalVisible(true); }}>
        <ButtonText>Atendimento Preferencial</ButtonText>
      </Button>
      <Modal visible={modalVisible} transparent animationType="slide">
        <ModalContainer>
          <ModalContent>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>Confirmar Atendimento?</Text>
            <Button primary onPress={printTicket}>
              <ButtonText>Confirmar</ButtonText>
            </Button>
            <Button onPress={() => setModalVisible(false)}>
              <ButtonText>Cancelar</ButtonText>
            </Button>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </Container>
  );
}
