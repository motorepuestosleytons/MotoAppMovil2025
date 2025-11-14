// src/views/LoginScreen.js (SOLUCIÓN DEFINITIVA: Chequeo de rol y navegación inmediata)

import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
    ActivityIndicator,Image
} from "react-native"; 

import { db, auth } from "../database/firebaseconfig"; 
import { collection, getDocs, query, where } from "firebase/firestore"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons"; 

// FUNCIÓN DUPLICADA para obtener el rol, garantizando velocidad de navegación.
const getRole = async (email) => {
    const lowerCaseEmail = email.trim().toLowerCase();
    try {
        const q = query(
            collection(db, 'Roles'), 
            where('correo', '==', lowerCaseEmail)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data().rol;
        }
        return null;
    } catch (error) {
        console.error("Error al obtener el rol durante el login:", error);
        return null;
    }
};


export default function LoginScreen({ navigation }) { 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);

    const acceder = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Campos vacíos', 'Por favor ingrese su correo y contraseña.');
            return;
        }
        setCargando(true);
        try {
            // 1. Autenticación de Firebase.
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // 2. 🚨 CRÍTICO: Consultar el rol inmediatamente después de la autenticación.
            const rol = await getRole(user.email); 

            if (rol === "Administrador") {
                // 3. Navegación instantánea al Tab de Administrador
                navigation.replace('MyTabsAdmon');
            } else if (rol === "Cliente") {
                // 4. Navegación instantánea al Tab de Cliente
                navigation.replace('MyTabsCliente'); 
            } else {
                 // Usuario sin rol válido, cerramos sesión para limpiar el estado
                await auth.signOut(); 
                Alert.alert("Error de Rol", "Usuario autenticado, pero sin rol válido. Sesión cerrada.");
                
            }
        
        } catch (error) {
            console.error("Error al iniciar sesión:", error.message);
            Alert.alert("Error", "Correo o contraseña incorrectos.");
            setEmail('');
            setPassword('');
        } finally {
            setCargando(false);
        }
    };
    
    // Función para continuar como invitado
    const continuarComoInvitado = () => {
        // El invitado siempre va a la vista de cliente.
        navigation.replace('MyTabsCliente');
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar Sesión</Text>
            
         <Image 
  source={require('../../assets/icon.png')} 
  style={styles.logo} 
  resizeMode="contain"
/>
            
            <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!cargando} />
            <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry editable={!cargando} />
            
            <TouchableOpacity style={[styles.button, cargando && styles.buttonDisabled]} onPress={acceder} disabled={cargando}>
                {cargando ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Entrar</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.guestButton} onPress={continuarComoInvitado} disabled={cargando}>
                <Text style={styles.guestButtonText}>Continuar como Invitado 🛒</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6fa', alignItems: 'center', justifyContent: 'center', padding: 20, },
    title: { fontSize: 26, fontWeight: 'bold', color: '#2f3640', marginBottom: 30, },
    input: { width: '90%', height: 50, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#dcdde1', },
    button: { backgroundColor: '#0097e6', width: '90%', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '600', },
    buttonDisabled: { backgroundColor: '#80c8ff' },
    guestButton: { width: '90%', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 15, borderColor: '#0097e6', borderWidth: 2 },
    guestButtonText: { color: '#0097e6', fontSize: 16, fontWeight: '600', },
});