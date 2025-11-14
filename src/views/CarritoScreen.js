// src/views/CarritoScreen.js (MODIFICADO - Añade estado a la venta)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { db, auth } from '../database/firebaseconfig'; 
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'; 
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Ionicons } from "@expo/vector-icons"; // Para el ícono de logout

// --------------------------------------------------------------------
// Componente de Imagen (Sin Cambios)
// --------------------------------------------------------------------
const CarritoItemImagen = ({ item }) => {
    const [imagenValida, setImagenValida] = useState(true);
    const manejarErrorImagen = () => { setImagenValida(false); };
    if (!imagenValida) {
        return (
            <View style={styles.itemNoImagen}>
                <Text style={styles.itemNoImagenTexto}>🖼️</Text>
            </View>
        );
    }
    return (
        <Image 
            source={{ uri: item.imagen }}
            style={styles.itemImage}
            onError={manejarErrorImagen}
        />
    );
};

// --------------------------------------------------------------------
// Registro Modal (Sin cambios de lógica desde el paso anterior)
// --------------------------------------------------------------------
const RegistroModal = ({ visible, onClose, navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // ESTADOS PARA DATOS DEL CLIENTE
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    const [isRegistering, setIsRegistering] = useState(true); 
    const [cargando, setCargando] = useState(false);

    // FUNCIÓN DE REGISTRO (Lógica sin cambios)
    const handleRegistro = async () => {
        if (!email.trim() || !password.trim() || !nombre.trim() || !telefono.trim() || !direccion.trim()) {
            Alert.alert('Error', 'Debe ingresar todos los datos (nombre, teléfono, dirección, correo y contraseña) para el registro.');
            return;
        }
        setCargando(true);
        try {
            // 1. CREACIÓN DE USUARIO EN FIREBASE AUTH
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
            
            // 2. REGISTRO DEL ROL
            await addDoc(collection(db, "Roles"), {
                correo: email.toLowerCase(),
                rol: "Cliente", 
            });
            
            // 3. REGISTRO DEL CLIENTE EN LA COLECCIÓN 'Clientes'
            await addDoc(collection(db, "Clientes"), {
                auth_uid: userId, 
                nombre: nombre.trim(),
                telefono: telefono.trim(),
                direccion: direccion.trim(),
                correo: email.toLowerCase(), 
            });

            Alert.alert("Éxito", "¡Cuenta creada y sesión iniciada! Ya puedes completar la compra.");
            onClose();
        } catch (error) {
            console.error("Error en el registro:", error.message);
            let mensajeError = "No se pudo crear la cuenta. Intente de nuevo.";
            if (error.code === 'auth/email-already-in-use') {
                mensajeError = 'El correo ya está registrado.';
            } else if (error.code === 'auth/weak-password') {
                mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
            }
            Alert.alert("Error de Registro", mensajeError);
        } finally {
            setCargando(false);
        }
    };
    
    // FUNCIÓN: LOGIN DENTRO DEL MODAL (Lógica sin cambios)
    const handleLoginModal = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Debe ingresar un correo y una contraseña.');
            return;
        }
        setCargando(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Alert.alert("Éxito", "¡Sesión iniciada! Ya puedes completar la compra.");
            onClose();
        } catch (error) {
            console.error("Error al iniciar sesión:", error.message);
            Alert.alert("Error de Sesión", "Correo o contraseña incorrectos.");
        } finally {
            setCargando(false);
        }
    };
    
    const handlePrimaryAction = () => {
        if (isRegistering) {
            handleRegistro();
        } else {
            handleLoginModal(); 
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.title}>
                        {isRegistering ? 'Crear Cuenta y Pagar' : 'Iniciar Sesión para Pagar'}
                    </Text>
                    
                    {/* SUBDIVISIÓN: DATOS PERSONALES */}
                    {isRegistering && (
                        <>
                            <Text style={modalStyles.sectionTitle}>Datos Personales</Text>
                            <TextInput style={modalStyles.input} placeholder="Nombre Completo" placeholderTextColor="#999" value={nombre} onChangeText={setNombre} editable={!cargando} />
                            <TextInput style={modalStyles.input} placeholder="Teléfono" placeholderTextColor="#999" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" editable={!cargando} />
                            <TextInput style={modalStyles.input} placeholder="Dirección de Residencia" placeholderTextColor="#999" value={direccion} onChangeText={setDireccion} editable={!cargando} />
                            
                            <Text style={modalStyles.sectionDivider} />
                            <Text style={modalStyles.sectionTitle}>Datos de la Cuenta</Text>
                        </>
                    )}
                    
                    {/* SUBDIVISIÓN: DATOS DE LA CUENTA (Email y Contraseña) */}
                    <TextInput style={modalStyles.input} placeholder="Correo electrónico" placeholderTextColor="#999" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!cargando} />
                    <TextInput style={modalStyles.input} placeholder="Contraseña" placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry editable={!cargando} />
                    
                    <TouchableOpacity style={modalStyles.primaryButton} onPress={handlePrimaryAction} disabled={cargando}>
                        {cargando ?
                        (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={modalStyles.primaryButtonText}>
                            {isRegistering ? 'Registrarse y Pagar' : 'Iniciar Sesión'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={modalStyles.secondaryButton} onPress={() => setIsRegistering(!isRegistering)}>
                        <Text style={modalStyles.secondaryButtonText}>
                            {isRegistering ?
                            '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
                        <Text style={modalStyles.closeButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};


// --------------------------------------------------------------------
// CarritoScreen (MODIFICADO para añadir estado a la venta)
// --------------------------------------------------------------------
const CarritoScreen = ({ carrito, setCarrito, cerrarSesion, clienteId, clienteEmail, clienteRol, navigation }) => {
    
    const [clienteListo, setClienteListo] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); 
    
    const total = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);
    const eliminarItem = (id) => { setCarrito(prev => prev.filter(item => item.id !== id)); };

    useEffect(() => {
        if (clienteId && clienteId !== "INVITADO_NO_AUTH") {
             setClienteListo(true);
        } else {
            setClienteListo(false);
        }
    }, [clienteId]);

    const procesarPago = async () => {
        if (carrito.length === 0) {
            Alert.alert("Atención", "El carrito está vacío.");
            return;
        }

        if (!clienteListo) {
             setModalVisible(true);
            return;
        }

        // Si clienteListo es true, clienteId y clienteEmail deben existir.
        const nombreVenta = clienteEmail || "Cliente Autenticado";

        try {
            const fechaString = new Date().toISOString();
            const ventaRef = await addDoc(collection(db, "Ventas"), {
                fecha_venta: fechaString, 
                id_documento_cliente: clienteId, 
                nombre_cliente: nombreVenta, 
                total_factura: total, 
                estado: "Recibido", // 🚨 MODIFICACIÓN CLAVE: Estado inicial del pedido
            });
            const detalleCollectionRef = collection(db, `Ventas/${ventaRef.id}/detalle_venta`);
            
            for (const item of carrito) {
                const detalleItem = {
                    id_producto: item.id, 
                    nombre_producto: item.nombre,
                    precio_unitario: item.precio_venta,
                    cantidad: item.cantidad,
                    total_item: item.precio_venta * item.cantidad, 
                };
                await addDoc(detalleCollectionRef, detalleItem);
            }
            
            Alert.alert("Éxito", `Venta ${ventaRef.id} registrada a nombre de ${nombreVenta} por $${total.toFixed(2)}. Estado: Recibido.`);
            setCarrito([]); 
        } catch (error) {
            console.error("Error al registrar la venta en 'Ventas':", error);
            Alert.alert("Error", "No se pudo completar el proceso de pago. Verifique la conexión a Firebase.");
        }
    };
    // ... (El resto de la función CarritoScreen y estilos no necesitan cambios)
    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            
            <CarritoItemImagen item={item} /> 

            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.nombre}</Text>
                <Text style={styles.itemDetails}>
                    Cantidad: {item.cantidad} | P. Unitario: ${item.precio_venta.toFixed(2)}
                </Text>
            </View>
            <Text style={styles.itemSubtotal}>
                ${(item.precio_venta * item.cantidad).toFixed(2)}
            </Text>
            <TouchableOpacity 
                onPress={() => eliminarItem(item.id)} style={styles.deleteButton}>
                <FontAwesome5 name="trash" size={18} color="#dc3545" />
            </TouchableOpacity>
        </View>
    );

    const clienteTexto = clienteListo ? `Cliente: ${clienteEmail}` : "Invitado (Debe Autenticarse)";
    const isGuest = !clienteListo;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🛒 Carrito de Compras</Text>
            
            <Text style={styles.clientInfo}>
                <Text style={[styles.clientName, isGuest && styles.guestNameText]}> 
                    {clienteTexto} 
                </Text>
            </Text>
            
            {carrito.length === 0 ? (
                <Text style={styles.emptyText}>El carrito está vacío. ¡Añade productos!</Text>
            ) : (
                <FlatList
                    data={carrito}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    style={styles.list}
                />
            )}
            
            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total a Pagar:</Text>
                    <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.payButton, (carrito.length === 0) && styles.payButtonDisabled]} 
                    onPress={procesarPago}
                    disabled={carrito.length === 0} 
                >
                    <Text style={styles.payButtonText}>
                        {isGuest ?
                        'Continuar y Autenticar' : `Pagar ($${total.toFixed(2)})`}
                    </Text>
                </TouchableOpacity>

                {/* BOTÓN: Cerrar Sesión */}
                {!isGuest && (
                    <TouchableOpacity 
                        style={styles.logoutButton} 
                        onPress={() => cerrarSesion(navigation)} 
                    >
                        <Ionicons name="log-out-outline" size={20} color="#dc3545" />
                        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            <RegistroModal visible={modalVisible} onClose={() => setModalVisible(false)} navigation={navigation} />
        </View>
    );
};

// --------------------------------------------------------------------
// Estilos (Sin cambios)
// --------------------------------------------------------------------
const modalStyles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    
    // ESTILOS DE SUBDIVISIONES
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginTop: 15, 
        marginBottom: 10, 
        alignSelf: 'flex-start', // Alinea el título a la izquierda del modal
        color: '#444', 
    },
    sectionDivider: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 5,
    },
    
    input: { width: '100%', height: 45, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, marginBottom: 15, paddingHorizontal: 10, },
    primaryButton: { backgroundColor: '#007bff', 
        width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, },
    primaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    secondaryButton: { marginTop: 15, padding: 5 },
    secondaryButtonText: { color: '#007bff', fontSize: 14 },
    closeButton: { marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
    closeButtonText: { color: '#666', fontSize: 16 }
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    clientInfo: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
        backgroundColor: '#e3f2fd', 
        padding: 8,
        borderRadius: 5,
        borderLeftWidth: 3,
        borderLeftColor: '#2196F3',
    },
    clientName: {
        fontWeight: 'bold',
        color: '#0D47A1',
    },
    guestNameText: {
        color: '#ff9800', 
        fontStyle: 'italic',
    },
    list: { flexGrow: 1 },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 10,
    },
    itemNoImagen: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemNoImagenTexto: {
        fontSize: 24,
    },
    itemInfo: { flex: 3 },
    itemName: { fontSize: 16, fontWeight: 'bold' },
    itemDetails: { fontSize: 12, color: '#666' },
    itemSubtotal: { flex: 1, textAlign: 'right', fontWeight: 'bold', fontSize: 16, color: '#444' },
    deleteButton: { marginLeft: 10, padding: 5 },
    footer: { borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 10 },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    totalLabel: { fontSize: 18, fontWeight: 'bold' },
    totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#28A745' },
    payButton: {
        backgroundColor: '#28A745',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    payButtonDisabled: { 
        backgroundColor: '#90b99c',
    },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999' },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#ffe8e8',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f5c6cb',
    },
    logoutButtonText: {
        color: '#dc3545',
        marginLeft: 8,
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default CarritoScreen;