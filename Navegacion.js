// Navegacion.js (CORREGIDO: SIN ALERT, clienteId sincronizado)

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; 
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native"; 

// Pantallas
import CatalogoScreen from "./src/views/CatalogoScreen";
import CarritoScreen from "./src/views/CarritoScreen";
import PedidosScreen from "./src/views/PedidosScreen";
import Clientes from "./src/views/Clientes";
import Productos from "./src/views/Productos";
import Proveedores from "./src/views/Proveedores";
import Compras from "./src/views/Compras";
import Ventas from "./src/views/Ventas";
import LoginScreen from "./src/views/LoginScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator(); 
const MainTabsStack = createNativeStackNavigator();

const styles = StyleSheet.create({
    badge: { position: 'absolute', right: -6, top: -3, backgroundColor: 'red', borderRadius: 9, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
});

const ProductosStack = ({ cerrarSesion, onAgregar }) => (
    <Stack.Navigator>
        <Stack.Screen name="Productos" children={(props) => <Productos {...props} cerrarSesion={cerrarSesion} />} options={{ headerShown: false }} />
        <Stack.Screen name="Catalogo" children={(props) => <CatalogoScreen {...props} onAgregar={onAgregar} cerrarSesion={cerrarSesion} />} options={{ headerShown: true, title: "Catálogo" }} />
    </Stack.Navigator>
);

// Cliente Tabs
function MyTabsCliente({ cerrarSesion, carrito, setCarrito, onAgregar, clienteId, clienteEmail, clienteRol }) {
    const cartCount = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    return (
        <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "#7C7CFF" }}>
            <Tab.Screen
                name="CatalogoMain"
                children={(props) => <CatalogoScreen {...props} onAgregar={onAgregar} cerrarSesion={cerrarSesion} />}
                options={{
                    title: 'Productos',
                    tabBarIcon: ({ size, color }) => <Ionicons name="pricetags" color={color} size={size} />,
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="PedidosCliente"
                children={(props) => <PedidosScreen {...props} clienteId={clienteId} />}
                options={{
                    title: 'Mis Pedidos',
                    tabBarIcon: ({ size, color }) => <Ionicons name="archive-outline" color={color} size={size} />,
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Carrito"
                children={(props) => (
                    <CarritoScreen 
                        {...props} 
                        carrito={carrito} 
                        setCarrito={setCarrito} 
                        cerrarSesion={cerrarSesion} 
                        clienteId={clienteId} 
                        clienteEmail={clienteEmail} 
                        clienteRol={clienteRol} 
                    />
                )}
                options={{
                    tabBarIcon: ({ size, color }) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="cart" color={color} size={size} />
                            {cartCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{cartCount}</Text>
                                </View>
                            )}
                        </View>
                    ),
                    headerShown: true,
                }}
            />
        </Tab.Navigator>
    );
}

// Admin Tabs
function MyTabsAdmon({ cerrarSesion, onAgregar }) {
    return (
        <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "#7C7CFF" }}>
            <Tab.Screen name="Clientes" children={(props) => <Clientes {...props} cerrarSesion={cerrarSesion} />} options={{ tabBarIcon: ({ size, color }) => <Ionicons name="people" color={color} size={size} />, headerShown: false }} />
            <Tab.Screen name="ProductosStack" children={(props) => <ProductosStack {...props} cerrarSesion={cerrarSesion} onAgregar={onAgregar} />} options={{ tabBarIcon: ({ size, color }) => <Ionicons name="list" color={color} size={size} />, headerShown: false, title: "Productos" }} />
            <Tab.Screen name="Proveedores" component={Proveedores} options={{ tabBarIcon: ({ size, color }) => <Ionicons name="pricetag" color={color} size={size} />, headerShown: false }} />
            <Tab.Screen name="Compras" component={Compras} options={{ tabBarIcon: ({ size, color }) => <Ionicons name="cart" color={color} size={size} />, headerShown: false }} />
            <Tab.Screen name="Ventas" component={Ventas} options={{ tabBarIcon: ({ size, color }) => <Ionicons name="cash" color={color} size={size} />, headerShown: false }} />
        </Tab.Navigator>
    );
}

// Navegación Principal
export default function Navegacion({ cerrarSesion, carrito, setCarrito, onAgregar, initialRoute, clienteId, clienteEmail, clienteRol }) {
    return (
        <NavigationContainer>
            <MainTabsStack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
                <MainTabsStack.Screen name="Login" component={LoginScreen} />
                <MainTabsStack.Screen 
                    name="MyTabsCliente"
                    children={(props) => (
                        <MyTabsCliente 
                            {...props} 
                            cerrarSesion={cerrarSesion} 
                            carrito={carrito} 
                            setCarrito={setCarrito} 
                            onAgregar={onAgregar}
                            clienteId={clienteId}
                            clienteEmail={clienteEmail}
                            clienteRol={clienteRol} 
                        />
                    )}
                />
                <MainTabsStack.Screen 
                    name="MyTabsAdmon"
                    children={(props) => <MyTabsAdmon {...props} cerrarSesion={cerrarSesion} onAgregar={onAgregar} />}
                />
            </MainTabsStack.Navigator>
        </NavigationContainer>
    );
}