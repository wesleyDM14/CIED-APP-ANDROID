import React, { useEffect, useState, useCallback } from "react";
import { Text, Image, Modal, Alert, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import styled from "styled-components/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import api from "@/lib/apiService";

SplashScreen.preventAutoHideAsync();

interface ButtonProps {
  primary?: boolean;
  small?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
}

interface ButtonTextProps {
  small?: boolean;
}

const shadowStyle: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

const modalShadowStyle: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 8,
};

const Container = styled.View`
  flex: 1;
  background-color: #f4f4f4;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const Logo = styled.Image`
  width: 250px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: #1a332d;
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 20px;
  color: #6e6e6e;
  margin-bottom: 40px;
  text-align: center;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  gap: 20px;
`;

const Button = styled.TouchableOpacity<ButtonProps>`
  background-color: ${(props: ButtonProps) => props.primary ? "#e2c27b" : "#1a332d"};
  padding: ${(props: ButtonProps) => props.small ? "12px 25px" : "15px 40px"};
  border-radius: 10px;
  margin: 10px;
  width: ${(props: ButtonProps) => props.fullWidth ? "100%" : "48%"};
  align-items: center;
`;

const ButtonText = styled.Text<ButtonTextProps>`
  color: #ffffff;
  font-size: ${(props: ButtonTextProps) => props.small ? "16px" : "18px"};
  font-weight: bold;
  text-align: center;
`;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  width: 80%;
  max-width: 400px;
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  align-items: center;
`;

const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1a332d;
  text-align: center;
`;

const ModalButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
`;

function App() {
  const [isReady, setIsReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("inset-swipe");
      } catch (e) {
        console.warn("Erro ao inicializar:", e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  const handleTicketGeneration = useCallback(async () => {
    console.log(process.env.EXPO_PUBLIC_API_URL);
    setIsLoading(true);
    try {
      const response = await api.post("/api/tickets/create", { type: selectedType });
      const ticketNumber = response.data.number;

      try {
        // Aqui você implementaria a lógica de impressão
        console.log(`Imprimindo ticket: ${ticketNumber}`);
      } catch (printError) {
        console.error("Erro na impressão:", printError);

        Alert.alert(
          "Atenção",
          "Ticket gerado, mas houve um problema na impressão",
          [{ text: "OK" }]
        );
      }

      Alert.alert(
        "Sucesso",
        `Sua senha é: ${ticketNumber}`,
        [{ text: "OK" }]
      );

    } catch (error) {
      console.error("Erro ao gerar ticket:", error);
      Alert.alert(
        "Erro",
        "Não foi possível gerar o ticket. Tente novamente.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
      setModalVisible(false);
    }
  }, [selectedType]);

  const selectTicketType = useCallback((type: string) => {
    setSelectedType(type);
    setModalVisible(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <StatusBar hidden />
      <Container>
        <Logo source={require('../assets/images/logo.png')} />
        <Title>Atendimento</Title>
        <Subtitle>Escolha o tipo de atendimento</Subtitle>

        <ButtonContainer>
          <Button
            primary
            onPress={() => selectTicketType("NORMAL")}
            disabled={isLoading}
            style={shadowStyle}
          >
            <ButtonText>{"Atendimento\nNormal"}</ButtonText>
          </Button>

          <Button
            onPress={() => selectTicketType("PREFERENCIAL")}
            disabled={isLoading}
            style={shadowStyle}
          >
            <ButtonText>{"Atendimento\nPreferencial"}</ButtonText>
          </Button>
        </ButtonContainer>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => !isLoading && setModalVisible(false)}
        >
          <ModalContainer>
            <ModalContent style={modalShadowStyle}>
              <ModalTitle>
                Confirmar {selectedType === "PREFERENCIAL" ? "Atendimento Preferencial" : "Atendimento Normal"}?
              </ModalTitle>

              <ModalButtonContainer>
                <Button
                  primary
                  small
                  onPress={handleTicketGeneration}
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.7 : 1, ...shadowStyle }}
                >
                  <ButtonText small>
                    {isLoading ? "Processando..." : "Confirmar"}
                  </ButtonText>
                </Button>

                <Button
                  small
                  onPress={() => !isLoading && setModalVisible(false)}
                  disabled={isLoading}
                  style={shadowStyle}
                >
                  <ButtonText small>Cancelar</ButtonText>
                </Button>
              </ModalButtonContainer>
            </ModalContent>
          </ModalContainer>
        </Modal>
      </Container>
    </>
  );
}

export default App;