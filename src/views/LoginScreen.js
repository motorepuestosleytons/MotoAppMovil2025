// src/views/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../database/firebaseconfig";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa ambos campos.");
      return;
    }

    try {
      setCargando(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // 👇 No redirigimos manualmente.
      // App.js controla el cambio de pantalla automáticamente.
    } catch (error) {
      console.log("Error de login:", error.code);
      let mensaje = "Error al iniciar sesión.";

      if (error.code === "auth/invalid-email") mensaje = "Correo inválido.";
      else if (error.code === "auth/user-not-found")
        mensaje = "Usuario no encontrado.";
      else if (error.code === "auth/wrong-password")
        mensaje = "Contraseña incorrecta.";
      else if (error.code === "auth/too-many-requests")
        mensaje = "Demasiados intentos. Intenta más tarde.";

      Alert.alert("Error", mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.formulario}>
        <Text style={styles.titulo}>Iniciar Sesión</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity
          style={[styles.boton, cargando && { backgroundColor: "#a0c4ff" }]}
          onPress={manejarLogin}
          disabled={cargando}
        >
          <Text style={styles.textoBoton}>
            {cargando ? "Iniciando..." : "Entrar"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  formulario: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "white",
  },
  boton: {
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  textoBoton: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;
