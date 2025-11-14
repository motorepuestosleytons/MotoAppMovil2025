import React, { useState, useEffect } from "react";
import Navegacion from './Navegacion'; 
import { Alert, View, ActivityIndicator, Text } from 'react-native'; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from './src/database/firebaseconfig'; 
import { collection, query, where, getDocs } from "firebase/firestore";

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState(null); 
    const [currentUser, setCurrentUser] = useState(null);
    const [carrito, setCarrito] = useState([]);

    // Función para obtener el rol del usuario desde Firestore (Sin cambios)
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
            console.error("[ERROR_FIRESTORE] Error al obtener el rol:", error);
            return null;
        }
    };

    // EFECTO: Chequea el estado de autenticación y el rol al iniciar (Sin cambios)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user); 
            if (user) {
                const rol = await getRole(user.email);
                if (rol) {
                    setUserRole(rol);
                    setIsAuthenticated(true);
                } else {
                    // Cierre de sesión automático si no tiene rol.
                    await signOut(auth);
                    Alert.alert("Error de Rol", "Usuario autenticado, pero sin rol válido. Sesión cerrada.");
                    setIsAuthenticated(false);
                    setUserRole(null);
                }
            } else {
                // Cuando el usuario es NULL
                setIsAuthenticated(false);
                setUserRole(null);
            }
            setIsLoading(false); 
        });

        return () => unsubscribe();
    }, []);


    // 🚨 CORRECCIÓN CLAVE: Acepta 'navigation' y fuerza la redirección.
    const cerrarSesion = async (navigation) => { 
        try {
            await signOut(auth);
            Alert.alert("Adiós", "Has cerrado la sesión.");
            setCarrito([]); 
            
            // 🚨 FORZAR NAVEGACIÓN A LOGIN
            if (navigation) {
                navigation.replace('Login');
            }
            // Si navigation no se pasa, confiamos en el listener, aunque es menos confiable.

        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
            Alert.alert("Error", "No se pudo cerrar la sesión correctamente. Inténtelo de nuevo.");
        }
    };
    
    // FUNCIÓN DE AGREGAR AL CARRITO (Sin cambios)
    const agregarAlCarrito = (producto) => {
        setCarrito(prevCarrito => {
            const existe = prevCarrito.find(item => item.id === producto.id);
            if (existe) {
                Alert.alert("Éxito", `Se añadió otra unidad de ${producto.nombre} al carrito.`);
                return prevCarrito.map(item =>
                    item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            } else {
                Alert.alert("Éxito", `${producto.nombre} añadido al carrito.`);
                return [...prevCarrito, { ...producto, cantidad: 1, imagen: producto.imagen }]; 
            }
        });
    };
    
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#1E90FF" />
                <Text style={{ marginTop: 10 }}>Verificando sesión...</Text>
            </View>
        );
    }

    // LÓGICA DE DATOS PARA NAVEGACIÓN (Sin cambios) 
    let clienteEmail = currentUser ? currentUser.email : "Invitado";
    let clienteId = currentUser ? currentUser.uid : "INVITADO_NO_AUTH";
    let clienteRol = userRole;

    return (
        <Navegacion 
            authLoaded={!isLoading}
            cerrarSesion={cerrarSesion} // Función que YA NO necesita el objeto navigation aquí
            carrito={carrito}
            setCarrito={setCarrito}
            onAgregar={agregarAlCarrito} 
            clienteEmail={clienteEmail}
            clienteId={clienteId}
            clienteRol={clienteRol}
            rol={clienteRol} 
        />
    );
}