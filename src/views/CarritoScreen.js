// src/screens/CarritoScreen.js (STOCK 100% CONTROLADO + VALIDACIONES COMPLETAS)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { db, auth } from '../database/firebaseconfig'; 
import { collection, addDoc, getDocs, query, where, doc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
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
// Registro Modal (Login / Registro) - SOLO @GMAIL.COM
// --------------------------------------------------------------------
const RegistroModal = ({ visible, onClose, navigation, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [isRegistering, setIsRegistering] = useState(true); 
    const [cargando, setCargando] = useState(false);
    
    const [nombreError, setNombreError] = useState('');
    const [telefonoError, setTelefonoError] = useState('');
    const [direccionError, setDireccionError] = useState('');
    const [emailError, setEmailError] = useState('');

    const validateGmail = (email) => {
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
        return gmailRegex.test(email.trim());
    };

    const formatTelefono = (text) => {
        const cleaned = ('' + text).replace(/[^0-9]/g, '');
        let formatted = '';
        if (cleaned.length > 4) {
            formatted = cleaned.substring(0, 4) + '-' + cleaned.substring(4, 8);
        } else {
            formatted = cleaned;
        }
        return formatted.substring(0, 9);
    };

    const handleRegistro = async () => {
        setNombreError(''); setTelefonoError(''); setDireccionError(''); setEmailError('');

        if (!email.trim() || !password.trim() || !nombre.trim() || !telefono.trim() || !direccion.trim()) {
            Alert.alert('Error', 'Debe ingresar todos los datos.');
            return;
        }

        if (!validateGmail(email)) {
            setEmailError('Solo se permiten correos @gmail.com');
            Alert.alert('Correo inválido', 'Por favor, ingresa un correo de Gmail (@gmail.com)');
            return;
        }

        const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!nombreRegex.test(nombre.trim())) {
            setNombreError('Solo se permiten letras en el nombre.');
            return;
        }

        const telefonoRegex = /^\d{4}-\d{4}$/; 
        if (!telefonoRegex.test(telefono.trim())) {
            setTelefonoError('Formato: 8888-8888');
            return;
        }

        setCargando(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
            
            await addDoc(collection(db, "Roles"), { correo: email.toLowerCase(), rol: "Cliente" });
            
            const clienteData = {
                auth_uid: userId, 
                nombre: nombre.trim(),
                telefono: telefono.trim(),
                direccion: direccion.trim(),
                correo: email.toLowerCase(), 
            };
            
            await addDoc(collection(db, "Clientes"), clienteData);

            Alert.alert("Éxito", "¡Cuenta creada y sesión iniciada!");
            onClose();
            onLoginSuccess(userId, email, clienteData); 
        } catch (error) {
            let msg = "No se pudo crear la cuenta.";
            if (error.code === 'auth/email-already-in-use') msg = 'Este Gmail ya está registrado.';
            else if (error.code === 'auth/weak-password') msg = 'La contraseña debe tener al menos 6 caracteres.';
            Alert.alert("Error", msg);
        } finally {
            setCargando(false);
        }
    };
    
    const handleLoginModal = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Ingresa correo y contraseña.');
            return;
        }
        if (!validateGmail(email)) {
            setEmailError('Solo se permiten correos @gmail.com');
            Alert.alert('Correo inválido', 'Debes iniciar sesión con un correo @gmail.com');
            return;
        }
        setCargando(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            Alert.alert("Éxito", "¡Sesión iniciada!");
            onClose();
            onLoginSuccess(userCredential.user.uid, userCredential.user.email, null); 
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
                <View style={modalStyles.modalContenido}>
                    <Text style={modalStyles.title}>
                        {isRegistering ? 'Crear Cuenta y Pagar' : 'Iniciar Sesión para Pagar'}
                    </Text>
                    
                    {isRegistering && (
                        <>
                            <Text style={modalStyles.sectionTitle}>Datos Personales</Text>
                            <TextInput 
                                style={modalStyles.input} 
                                placeholder="Nombre Completo" 
                                value={nombre} 
                                onChangeText={(t) => { setNombre(t); if (nombreError) setNombreError(''); }} 
                                editable={!cargando} 
                            />
                            {!!nombreError && <Text style={modalStyles.errorText}>{nombreError}</Text>}

                            <TextInput 
                                style={modalStyles.input} 
                                placeholder="Teléfono (8888-8888)" 
                                value={telefono} 
                                onChangeText={(t) => { setTelefono(formatTelefono(t)); if (telefonoError) setTelefonoError(''); }} 
                                keyboardType="numeric" 
                                maxLength={9}
                                editable={!cargando} 
                            />
                            {!!telefonoError && <Text style={modalStyles.errorText}>{telefonoError}</Text>}

                            <TextInput 
                                style={modalStyles.input} 
                                placeholder="Dirección" 
                                value={direccion} 
                                onChangeText={(t) => { setDireccion(t); if (direccionError) setDireccionError(''); }} 
                                editable={!cargando} 
                            />
                            {!!direccionError && <Text style={modalStyles.warningText}>{direccionError}</Text>}

                            <View style={modalStyles.sectionDivider} /> 
                            <Text style={modalStyles.sectionTitle}>Cuenta Gmail</Text>
                        </>
                    )}
                    
                    <View style={modalStyles.inputContainer}>
                        <TextInput 
                            style={[modalStyles.input, !!emailError && modalStyles.inputError]} 
                            placeholder="ejemplo@gmail.com" 
                            value={email} 
                            onChangeText={(t) => { 
                                setEmail(t); 
                                if (emailError && validateGmail(t)) setEmailError(''); 
                            }} 
                            keyboardType="email-address" 
                            autoCapitalize="none" 
                            editable={!cargando} 
                        />
                        <Ionicons 
                            name={email && validateGmail(email) ? "checkmark-circle" : "mail-outline"} 
                            size={20} 
                            color={email && validateGmail(email) ? "#28A745" : "#999"} 
                            style={modalStyles.inputIcon} 
                        />
                    </View>
                    {!!emailError && <Text style={modalStyles.errorText}>{emailError}</Text>}

                    <TextInput 
                        style={modalStyles.input} 
                        placeholder="Contraseña" 
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry 
                        editable={!cargando} 
                    />
                    
                    <TouchableOpacity 
                        style={[modalStyles.primaryButton, cargando && { opacity: 0.7 }]} 
                        onPress={handlePrimaryAction} 
                        disabled={cargando}
                    >
                        {cargando ? <ActivityIndicator color="#fff" /> : 
                         <Text style={modalStyles.primaryButtonText}>
                             {isRegistering ? 'Registrarse y Pagar' : 'Iniciar Sesión'}
                         </Text>}
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
// PAGO MODAL (RESTA STOCK ATÓMICO)
// --------------------------------------------------------------------
const PagoModal = ({ visible, onClose, total, clienteId, clienteData, setCarrito, carrito, navigation }) => {
    const [tarjeta, setTarjeta] = useState('');
    const [mes, setMes] = useState('');
    const [anio, setAnio] = useState('');
    const [cvv, setCvv] = useState('');
    const [cargando, setCargando] = useState(false);

    const validarTarjetaSimulada = (numTarjeta) => { return numTarjeta.length >= 13 && numTarjeta.length <= 19; };
    const validarFechaSimulada = () => {
        const year = parseInt(anio);
        const month = parseInt(mes);
        return month >= 1 && month <= 12 && year >= 24 && year <= 30;
    };

    const formatearTarjeta = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const parts = [];
        for (let i = 0; i < v.length; i += 4) parts.push(v.substring(i, i + 4));
        return parts.join(' ');
    };

    const handlePago = async () => {
        const numTarjeta = tarjeta.replace(/\s/g, '');
        
        if (!clienteData || !clienteData.auth_uid) return Alert.alert("Error", "Datos de cliente incompletos o sesión expirada.");
        
        if (!validarTarjetaSimulada(numTarjeta)) return Alert.alert("Error", "Número de tarjeta simulado inválido (Longitud incorrecta).");
        if (!validarFechaSimulada()) return Alert.alert("Error", "Fecha de expiración simulada inválida (MM/AA entre 01/24 y 12/30).");
        if (cvv.length !== 3) return Alert.alert("Error", "CVV simulado inválido (Debe ser de 3 dígitos).");

        setCargando(true);
        await new Promise(r => setTimeout(r, 1500));

        try {
            const ventaRef = await addDoc(collection(db, "Ventas"), {
                fecha_venta: new Date().toISOString(),
                id_documento_cliente: clienteId,
                nombre_cliente: clienteData.nombre, 
                direccion_cliente: clienteData.direccion,
                correo_cliente: clienteData.correo,
                telefono_cliente: clienteData.telefono || "N/A", 
                total_factura: total,
                estado: "Nuevo Pedido",
            });

            const detalleRef = collection(db, `Ventas/${ventaRef.id}/detalle_venta`);
            const promesasDetalle = carrito.map(item => addDoc(detalleRef, {
                id_producto: item.id,
                nombre_producto: item.nombre,
                precio_unitario: item.precio_venta,
                cantidad: item.cantidad,
                total_item: item.precio_venta * item.cantidad,
            }));
            await Promise.all(promesasDetalle);

            // === RESTAR STOCK ATÓMICO ===
            const promesasStock = carrito.map(async (item) => {
                const prodRef = doc(db, "Productos", item.id);
                await updateDoc(prodRef, {
                    stock: increment(-item.cantidad)
                });
            });
            await Promise.all(promesasStock);

            Alert.alert("¡Éxito!", `Pago de C$ ${total} procesado. Gracias por tu compra, ${clienteData.nombre.split(' ')[0]}!`, [{
                text: "OK",
                onPress: () => {
                    setCarrito([]);
                    onClose();
                }
            }]);
        } catch (error) {
            console.error("Error al procesar el pago: ", error);
            Alert.alert("Error", "No se pudo procesar el pago o actualizar el stock.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={pagoStyles.overlay}>
                <View style={pagoStyles.modal}>
                    <Text style={pagoStyles.title}>Confirmar Pago</Text>

                    {clienteData ? (
                        <View style={pagoStyles.section}>
                            <Text style={pagoStyles.sectionTitle}>Datos de Envío</Text>
                            <Text style={pagoStyles.infoText}>**{clienteData.nombre}**</Text>
                            <Text style={pagoStyles.infoText}>Dirección: {clienteData.direccion}</Text>
                            <Text style={pagoStyles.infoText}>Teléfono: {clienteData.telefono}</Text>
                            <Text style={pagoStyles.infoText}>Correo: {clienteData.correo}</Text>
                        </View>
                    ) : (
                        <Text style={pagoStyles.loadingText}>Cargando datos del cliente...</Text>
                    )}

                    <View style={pagoStyles.section}>
                        <Text style={pagoStyles.sectionTitle}>Inserte los datos de su tarjeta</Text>
                        <TextInput style={pagoStyles.input} placeholder="Número de Tarjeta" value={tarjeta} onChangeText={v => setTarjeta(formatearTarjeta(v))} keyboardType="numeric" maxLength={19} editable={!cargando} />
                        <View style={pagoStyles.row}>
                            <TextInput style={[pagoStyles.input, pagoStyles.inputQuarter]} placeholder="MM" value={mes} onChangeText={setMes} keyboardType="numeric" maxLength={2} editable={!cargando} />
                            <Text style={pagoStyles.slash}>/</Text>
                            <TextInput style={[pagoStyles.input, pagoStyles.inputQuarter]} placeholder="AA" value={anio} onChangeText={setAnio} keyboardType="numeric" maxLength={2} editable={!cargando} />
                            <TextInput style={[pagoStyles.input, pagoStyles.inputCvv]} placeholder="CVV" value={cvv} onChangeText={setCvv} keyboardType="numeric" maxLength={3} secureTextEntry editable={!cargando} />
                        </View>
                    </View>

                    <View style={pagoStyles.totalSection}>
                        <Text style={pagoStyles.totalLabel}>Total:</Text>
                        <Text style={pagoStyles.totalAmount}>C$ {total}</Text>
                    </View>

                    <TouchableOpacity style={[pagoStyles.payButton, (cargando || !clienteData) && pagoStyles.payButtonDisabled]} onPress={handlePago} disabled={cargando || !clienteData}>
                        {cargando ? <ActivityIndicator color="#fff" /> : <Text style={pagoStyles.payButtonText}>Pagar C$ {total}</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={pagoStyles.cancelButton} onPress={onClose} disabled={cargando}>
                        <Text style={pagoStyles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// --------------------------------------------------------------------
// CarritoScreen (Principal) - STOCK EN TIEMPO REAL + VALIDACIONES TOTALES
// --------------------------------------------------------------------
const CarritoScreen = ({ route, navigation, carrito, setCarrito, cerrarSesion }) => {
    const { clienteId: routeClienteId = null, clienteEmail: routeClienteEmail = null } = route.params || {};
    
    const [clienteId, setClienteId] = useState(routeClienteId); 
    const [clienteEmail, setClienteEmail] = useState(routeClienteEmail); 
    const [clienteData, setClienteData] = useState(null); 
    const [modalVisible, setModalVisible] = useState(false);
    const [pagoModalVisible, setPagoModalVisible] = useState(false);
    const [productosStock, setProductosStock] = useState({}); // ← STOCK EN TIEMPO REAL

    useEffect(() => {
        if (!clienteId && auth.currentUser) {
            setClienteId(auth.currentUser.uid);
            setClienteEmail(auth.currentUser.email);
        }
    }, [route.params]);

    // === ESCUCHA EN TIEMPO REAL DE STOCK (SE REFRESCA SIEMPRE) ===
    useEffect(() => {
        const q = query(collection(db, "Productos"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const stockMap = {};
            snapshot.docs.forEach(doc => {
                stockMap[doc.id] = doc.data().stock || 0;
            });
            setProductosStock(stockMap);
        }, (error) => {
            console.error("Error en onSnapshot de stock:", error);
        });

        return () => unsubscribe();
    }, []);

    const total = Math.round(carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0));
    const clienteListo = clienteId && clienteData && clienteData.nombre;

    const cargarDatosCliente = async (uid, email) => {
        if (!uid) { setClienteData(null); return; }
        try {
            const q = query(collection(db, "Clientes"), where("auth_uid", "==", uid));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const data = querySnapshot.docs[0].data();
                setClienteData({ 
                    nombre: data.nombre, 
                    direccion: data.direccion, 
                    telefono: data.telefono,
                    correo: data.correo, 
                    auth_uid: uid 
                });
            } else {
                setClienteData({ 
                    nombre: email.split('@')[0],
                    direccion: "Dirección No Registrada", 
                    correo: email, 
                    auth_uid: uid, 
                    telefono: "N/A" 
                });
            }
        } catch (error) {
            console.error("Error al cargar datos del cliente:", error);
            setClienteData({ 
                nombre: email || "Error de Carga", 
                direccion: "Error de Carga", 
                correo: email || "N/A", 
                auth_uid: uid, 
                telefono: "N/A" 
            });
        }
    };

    useEffect(() => {
        if (clienteId) {
            cargarDatosCliente(clienteId, clienteEmail);
        } else {
            setClienteData(null);
        }
    }, [clienteId, clienteEmail]);

    const handleLoginSuccess = (uid, email, dataFromRegistration = null) => {
        setClienteId(uid);
        setClienteEmail(email);
        setModalVisible(false);
        
        if (dataFromRegistration) {
            setClienteData(dataFromRegistration); 
            setPagoModalVisible(true);
        } else {
            cargarDatosCliente(uid, email).then(() => {
                setPagoModalVisible(true);
            });
        }
    };
    
    const handleCerrarSesion = (navigation) => {
        setClienteId(null);
        setClienteEmail(null);
        setClienteData(null);
        cerrarSesion(navigation);
    }

    // === MODIFICAR CANTIDAD CON VALIDACIÓN ESTRICTA DE STOCK ===
    const modificarCantidad = (id, delta) => {
        const item = carrito.find(i => i.id === id);
        if (!item) return;

        const stockActual = productosStock[id] || 0;
        const totalEnCarrito = carrito.reduce((sum, i) => i.id === id ? sum + i.cantidad : sum, 0);
        const nuevaCantidad = totalEnCarrito + delta;

        // Validación: no superar stock
        if (nuevaCantidad > stockActual) {
            const maxPermitido = stockActual - (totalEnCarrito - item.cantidad);
            Alert.alert(
                "Stock Insuficiente",
                `Solo hay ${stockActual} unidad${stockActual === 1 ? '' : 'es'} en stock.\n` +
                `Ya tienes ${totalEnCarrito} en el carrito.\n` +
                `Máximo permitido: ${maxPermitido}`,
                [{ text: "OK" }]
            );
            return;
        }

        // Validación: no bajar de 1
        if (delta < 0 && item.cantidad <= 1) return;

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

    const procesarPago = () => {
        if (carrito.length === 0) return Alert.alert("Atención", "El carrito está vacío.");
        if (!clienteId) return setModalVisible(true); 
        
        if (!clienteData) {
            cargarDatosCliente(clienteId, clienteEmail).then(() => {
                setPagoModalVisible(true);
            });
        } else {
            setPagoModalVisible(true);
        }
    };

    const renderItem = ({ item }) => {
        const subtotal = Math.round(item.precio_venta * item.cantidad);
        const stockDisponible = productosStock[item.id] || 0;
        const enCarrito = carrito.reduce((s, i) => i.id === item.id ? s + i.cantidad : s, 0);
        const restante = stockDisponible - enCarrito + item.cantidad; // Corrige visual

        const puedeAumentar = restante > 0;

        return (
            <View style={styles.itemContainer}>
                <CarritoItemImagen item={item} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.nombre}</Text>
                    <Text style={styles.itemDetails}>C$ {Math.round(item.precio_venta)} c/u</Text>
                    <Text style={[styles.stockInfo, restante <= 0 && { color: '#DC3545' }]}>
                        Stock restante: {restante}
                    </Text>
                </View>
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
                        disabled={!puedeAumentar}
                    >
                        <FontAwesome5 name="plus" size={12} color={!puedeAumentar ? "#ccc" : "#28A745"} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.itemSubtotal}>C$ {subtotal}</Text>
                <TouchableOpacity onPress={() => eliminarItem(item.id)} style={styles.deleteButton}>
                    <FontAwesome5 name="trash" size={16} color="#dc3545" />
                </TouchableOpacity>
            </View>
        );
    };

    const nombreMostrado = clienteData?.nombre?.split(' ')[0] || "Cliente";
    const clienteTexto = clienteData ? `Cliente: ${nombreMostrado} (${clienteData.correo})` : "Invitado (Autenticar)";
    const isGuest = !clienteId;

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
                        {clienteListo ? `Pagar C$ ${total}` : 'Autenticar y Pagar'}
                    </Text>
                </TouchableOpacity>

                {!isGuest && (
                    <TouchableOpacity style={styles.logoutButton} onPress={() => handleCerrarSesion(navigation)}>
                        <Ionicons name="log-out-outline" size={20} color="#dc3545" />
                        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            <RegistroModal 
                visible={modalVisible} 
                onClose={() => setModalVisible(false)} 
                navigation={navigation}
                onLoginSuccess={handleLoginSuccess}
            />
            <PagoModal
                visible={pagoModalVisible}
                onClose={() => setPagoModalVisible(false)}
                total={total}
                clienteId={clienteId}
                clienteData={clienteData} 
                setCarrito={setCarrito}
                carrito={carrito}
                navigation={navigation}
            />
        </View>
    );
};

// --------------------------------------------------------------------
// ESTILOS
// --------------------------------------------------------------------
const pagoStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modal: { width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 10 },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1a1a1a' },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 8 },
    infoText: { fontSize: 15, color: '#555', marginBottom: 4 },
    loadingText: { fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 16, backgroundColor: '#f9f9f9', fontFamily: 'monospace', marginBottom: 10 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    inputQuarter: { flex: 1, marginRight: 8, textAlign: 'center' }, 
    slash: { fontSize: 18, color: '#666', marginHorizontal: 4 },
    inputCvv: { width: 80, textAlign: 'center' },
    totalSection: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#eee' },
    totalLabel: { fontSize: 18, fontWeight: 'bold' },
    totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#28A745' },
    payButton: { backgroundColor: '#28A745', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    payButtonDisabled: { backgroundColor: '#90b99c' },
    cancelButton: { marginTop: 10, padding: 12, alignItems: 'center' },
    cancelButtonText: { color: '#dc3545', fontSize: 16 }
});

const modalStyles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContenido: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', elevation: 5 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 10, alignSelf: 'flex-start', color: '#444' },
    sectionDivider: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 5 },
    input: { width: '100%', height: 45, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, marginBottom: 15, paddingHorizontal: 10 },
    inputContainer: { position: 'relative', width: '100%' },
    inputIcon: { position: 'absolute', right: 12, top: 12 },
    inputError: { borderColor: '#dc3545', borderWidth: 1.5 },
    errorText: { color: '#dc3545', fontSize: 12, marginBottom: 10, alignSelf: 'flex-start', marginTop: -10, paddingHorizontal: 5 },
    warningText: { color: '#ffc107', fontSize: 12, marginBottom: 10, alignSelf: 'flex-start', marginTop: -10, paddingHorizontal: 5 },
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
    itemContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8, elevation: 1 },
    itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
    itemNoImagen: { width: 50, height: 50, borderRadius: 8, marginRight: 10, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
    itemNoImagenTexto: { fontSize: 24 },
    itemInfo: { flex: 2.8, paddingRight: 8 },
    itemName: { fontSize: 14, fontWeight: 'bold', color: '#333', flexShrink: 1 },
    itemDetails: { fontSize: 11, color: '#666' },
    stockInfo: { fontSize: 10, color: '#28A745', fontStyle: 'italic', marginTop: 2 },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 16, paddingHorizontal: 6, paddingVertical: 3, marginHorizontal: 6 },
    iconButton: { width: 22, height: 22, justifyContent: 'center', alignItems: 'center', borderRadius: 11, backgroundColor: '#fff', elevation: 1 },
    quantityText: { marginHorizontal: 8, fontSize: 13, fontWeight: '600', minWidth: 16, textAlign: 'center' },
    itemSubtotal: { fontWeight: 'bold', fontSize: 15, color: '#444', minWidth: 60, textAlign: 'right' },
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