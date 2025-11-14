// src/views/CarritoScreen.js (FINAL: selector +/− más pequeño)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { db, auth } from '../database/firebaseconfig'; 
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'; 
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Ionicons } from "@expo/vector-icons"; 

// --------------------------------------------------------------------
// Componente de Imagen
// --------------------------------------------------------------------
const CarritoItemImagen = ({ item }) => {
    const [imagenValida, setImagenValida] = useState(true);
    const manejarErrorImagen = () => { setImagenValida(false); };
    if (!imagenValida) {
        return (
            <View style={styles.itemNoImagen}>
                <Text style={styles.itemNoImagenTexto}>Imagen</Text>
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
// Registro Modal
// --------------------------------------------------------------------
const RegistroModal = ({ visible, onClose, navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [isRegistering, setIsRegistering] = useState(true); 
    const [cargando, setCargando] = useState(false);

    const handleRegistro = async () => {
        if (!email.trim() || !password.trim() || !nombre.trim() || !telefono.trim() || !direccion.trim()) {
            Alert.alert('Error', 'Debe ingresar todos los datos.');
            return;
        }
        setCargando(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
            
            await addDoc(collection(db, "Roles"), {
                correo: email.toLowerCase(),
                rol: "Cliente", 
            });
            
            await addDoc(collection(db, "Clientes"), {
                auth_uid: userId, 
                nombre: nombre.trim(),
                telefono: telefono.trim(),
                direccion: direccion.trim(),
                correo: email.toLowerCase(), 
            });

            Alert.alert("Éxito", "¡Cuenta creada y sesión iniciada!");
            onClose();
        } catch (error) {
            let mensajeError = "No se pudo crear la cuenta.";
            if (error.code === 'auth/email-already-in-use') mensajeError = 'El correo ya está registrado.';
            else if (error.code === 'auth/weak-password') mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
            Alert.alert("Error de Registro", mensajeError);
        } finally {
            setCargando(false);
        }
    };
    
    const handleLoginModal = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Debe ingresar correo y contraseña.');
            return;
        }
        setCargando(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Alert.alert("Éxito", "¡Sesión iniciada!");
            onClose();
        } catch (error) {
            Alert.alert("Error", "Correo o contraseña incorrectos.");
        } finally {
            setCargando(false);
        }
    };
    
    const handlePrimaryAction = () => {
        isRegistering ? handleRegistro() : handleLoginModal();
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.title}>
                        {isRegistering ? 'Crear Cuenta y Pagar' : 'Iniciar Sesión para Pagar'}
                    </Text>
                    
                    {isRegistering && (
                        <>
                            <Text style={modalStyles.sectionTitle}>Datos Personales</Text>
                            <TextInput style={modalStyles.input} placeholder="Nombre Completo" placeholderTextColor="#999" value={nombre} onChangeText={setNombre} editable={!cargando} />
                            <TextInput style={modalStyles.input} placeholder="Teléfono" placeholderTextColor="#999" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" editable={!cargando} />
                            <TextInput style={modalStyles.input} placeholder="Dirección" placeholderTextColor="#999" value={direccion} onChangeText={setDireccion} editable={!cargando} />
                            <View style={modalStyles.sectionDivider} /> 
                            <Text style={modalStyles.sectionTitle}>Datos de Cuenta</Text>
                        </>
                    )}
                    
                    <TextInput style={modalStyles.input} placeholder="Correo" placeholderTextColor="#999" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!cargando} />
                    <TextInput style={modalStyles.input} placeholder="Contraseña" placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry editable={!cargando} />
                    
                    <TouchableOpacity style={modalStyles.primaryButton} onPress={handlePrimaryAction} disabled={cargando}>
                        {cargando ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.primaryButtonText}>{isRegistering ? 'Registrarse y Pagar' : 'Iniciar Sesión'}</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={modalStyles.secondaryButton} onPress={() => setIsRegistering(!isRegistering)}>
                        <Text style={modalStyles.secondaryButtonText}>
                            {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
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
// CarritoScreen
// --------------------------------------------------------------------
const CarritoScreen = ({ carrito, setCarrito, cerrarSesion, clienteId, clienteEmail, clienteRol, navigation }) => {
    
    const [clienteListo, setClienteListo] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); 
    
    const total = Math.round(carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0));

    useEffect(() => {
        setClienteListo(clienteId && clienteId !== "INVITADO_NO_AUTH");
    }, [clienteId]);

    const modificarCantidad = (id, delta) => {
        setCarrito(prev => prev.map(item => {
            if (item.id === id) {
                const nueva = item.cantidad + delta;
                return nueva > 0 ? { ...item, cantidad: nueva } : null;
            }
            return item;
        }).filter(Boolean));
    };

    const eliminarItem = (id) => { 
        setCarrito(prev => prev.filter(item => item.id !== id)); 
    };

    const procesarPago = async () => {
        if (carrito.length === 0) return Alert.alert("Atención", "El carrito está vacío.");
        if (!clienteListo) return setModalVisible(true);

        const nombreVenta = clienteEmail || "Cliente Autenticado";

        try {
            const ventaRef = await addDoc(collection(db, "Ventas"), {
                fecha_venta: new Date().toISOString(),
                id_documento_cliente: clienteId,
                nombre_cliente: nombreVenta,
                total_factura: total,
                estado: "Nuevo Pedido",
            });

            const detalleRef = collection(db, `Ventas/${ventaRef.id}/detalle_venta`);
            for (const item of carrito) {
                await addDoc(detalleRef, {
                    id_producto: item.id,
                    nombre_producto: item.nombre,
                    precio_unitario: item.precio_venta,
                    cantidad: item.cantidad,
                    total_item: item.precio_venta * item.cantidad,
                });
            }

            Alert.alert("Éxito", `Venta registrada por C$ ${total}.`);
            setCarrito([]);
        } catch (error) {
            Alert.alert("Error", "No se pudo procesar el pago.");
        }
    };

    const renderItem = ({ item }) => {
        const subtotal = Math.round(item.precio_venta * item.cantidad);
        return (
            <View style={styles.itemContainer}>
                <CarritoItemImagen item={item} />
                
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.nombre}</Text>
                    <Text style={styles.itemDetails}>C$ {Math.round(item.precio_venta)} c/u</Text>
                </View>

                {/* SELECTOR MÁS PEQUEÑO */}
                <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                        onPress={() => modificarCantidad(item.id, -1)} 
                        style={styles.iconButton}
                        disabled={item.cantidad <= 1}
                    >
                        <FontAwesome5 name="minus" size={12} color={item.cantidad <= 1 ? "#ccc" : "#dc3545"} />
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{item.cantidad}</Text>

                    <TouchableOpacity 
                        onPress={() => modificarCantidad(item.id, 1)} 
                        style={styles.iconButton}
                    >
                        <FontAwesome5 name="plus" size={12} color="#28A745" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.itemSubtotal}>C$ {subtotal}</Text>

                <TouchableOpacity onPress={() => eliminarItem(item.id)} style={styles.deleteButton}>
                    <FontAwesome5 name="trash" size={16} color="#dc3545" />
                </TouchableOpacity>
            </View>
        );
    };

    const clienteTexto = clienteListo ? `Cliente: ${clienteEmail}` : "Invitado (Autenticar)";
    const isGuest = !clienteListo;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Carrito de Compras</Text>
                <TouchableOpacity style={styles.loginRedirectButton} onPress={() => navigation.navigate('Login')}>
                    <Ionicons name="log-in-outline" size={20} color="#007bff" />
                    <Text style={styles.loginRedirectButtonText}>Login</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.clientInfo}>
                <Text style={[styles.clientName, isGuest && styles.guestNameText]}>{clienteTexto}</Text>
            </Text>
            
            {carrito.length === 0 ? (
                <Text style={styles.emptyText}>El carrito está vacío.</Text>
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
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>C$ {total}</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.payButton, carrito.length === 0 && styles.payButtonDisabled]} 
                    onPress={procesarPago}
                    disabled={carrito.length === 0}
                >
                    <Text style={styles.payButtonText}>
                        {isGuest ? 'Autenticar y Pagar' : `Pagar C$ ${total}`}
                    </Text>
                </TouchableOpacity>

                {!isGuest && (
                    <TouchableOpacity style={styles.logoutButton} onPress={() => cerrarSesion(navigation)}>
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
// ESTILOS (Selector más pequeño)
// --------------------------------------------------------------------
const modalStyles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', elevation: 5 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 10, alignSelf: 'flex-start', color: '#444' },
    sectionDivider: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 5 },
    input: { width: '100%', height: 45, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, marginBottom: 15, paddingHorizontal: 10 },
    primaryButton: { backgroundColor: '#007bff', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    primaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    secondaryButton: { marginTop: 15, padding: 5 },
    secondaryButtonText: { color: '#007bff', fontSize: 14 },
    closeButton: { marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
    closeButtonText: { color: '#666', fontSize: 16 }
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    loginRedirectButton: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#e9f7fe', borderRadius: 8, borderWidth: 1, borderColor: '#007bff' },
    loginRedirectButtonText: { color: '#007bff', marginLeft: 4, fontWeight: '600' },
    clientInfo: { fontSize: 14, color: '#333', textAlign: 'center', marginBottom: 1, backgroundColor: '#e3f2fd', padding: 8, borderRadius: 5, borderLeftWidth: 3, borderLeftColor: '#2196F3' },
    clientName: { fontWeight: 'bold', color: '#0D47A1' },
    guestNameText: { color: '#ff9800', fontStyle: 'italic' },
    list: { flexGrow: 1 },
    itemContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 10, 
        backgroundColor: '#fff', 
        borderRadius: 8, 
        marginBottom: 8, 
        elevation: 1 
    },
    itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
    itemNoImagen: { width: 50, height: 50, borderRadius: 8, marginRight: 10, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
    itemNoImagenTexto: { fontSize: 24 },
    itemInfo: { flex: 2.8, paddingRight: 8 },
    itemName: { fontSize: 14, fontWeight: 'bold', color: '#333', flexShrink: 1 },
    itemDetails: { fontSize: 11, color: '#666' },

    // SELECTOR MÁS PEQUEÑO
    quantityContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#f8f9fa', 
        borderRadius: 16, 
        paddingHorizontal: 6,
        paddingVertical: 3,
        marginHorizontal: 6
    },
    iconButton: { 
        width: 22, 
        height: 22, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 11,
        backgroundColor: '#fff',
        elevation: 1
    },
    quantityText: { 
        marginHorizontal: 8, 
        fontSize: 13, 
        fontWeight: '600',
        minWidth: 16,
        textAlign: 'center'
    },

    itemSubtotal: { 
        fontWeight: 'bold', 
        fontSize: 15, 
        color: '#444',
        minWidth: 60,
        textAlign: 'right'
    },
    deleteButton: { marginLeft: 10, padding: 5 },
    footer: { borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 10 },
    totalContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    totalLabel: { fontSize: 18, fontWeight: 'bold' },
    totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#28A745' },
    payButton: { backgroundColor: '#28A745', padding: 15, borderRadius: 10, alignItems: 'center' },
    payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    payButtonDisabled: { backgroundColor: '#90b99c' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999' },
    logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, backgroundColor: '#ffe8e8', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#f5c6cb' },
    logoutButtonText: { color: '#dc3545', marginLeft: 8, fontWeight: 'bold', fontSize: 16 }
});

export default CarritoScreen;