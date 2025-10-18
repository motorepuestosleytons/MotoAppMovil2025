import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AntDesign from '@expo/vector-icons/AntDesign'; // Iconos

// 🚨 IMPORTACIONES DE VISTAS (Asegúrate de que estas rutas son correctas)
import LoginScreen from '../MotoApp/src/views/LoginScreen.js'; 
import Clientes from '../MotoApp/src/views/Clientes.js'; 
import Productos from '../MotoApp/src/views/Productos.js'; 
import Proveedores from '../MotoApp/src/views/Proveedores.js'; 
import Compras from '../MotoApp/src/views/Compras.js';    
import Ventas from '../MotoApp/src/views/Ventas.js';      


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// --- Stacks (No cambian, solo se incluyen para referencia) ---

function ClientesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Clientes" component={Clientes} options={{ title: 'Gestión de Clientes' }} />
    </Stack.Navigator>
  );
}

function ProductosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Productos" component={Productos} options={{ title: 'Gestión de Productos' }} />
    </Stack.Navigator>
  );
}

function ProveedoresStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Proveedores" component={Proveedores} options={{ title: 'Gestión de Proveedores' }} />
    </Stack.Navigator>
  );
}

function ComprasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Compras" component={Compras} options={{ title: 'Registro de Compras' }} />
    </Stack.Navigator>
  );
}

function VentasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Ventas" component={Ventas} options={{ title: 'Registro de Ventas' }} />
    </Stack.Navigator>
  );
}

// ----------------------------------------------------------------------
// Navegador de Pestañas (Tabs) con ÍCONOS CORREGIDOS
// ----------------------------------------------------------------------

function MyTabs() {
  return (
    <Tab.Navigator
      initialRouteName="ClientesTab"
      screenOptions={{
        tabBarActiveTintColor: '#457b9d', 
        headerShown: false, 
      }}
    >
      <Tab.Screen
        name="ClientesTab"
        component={ClientesStack}
        options={{
          tabBarLabel: 'Clientes',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="team" size={size} color={color} /> 
          ),
        }}
      />
      <Tab.Screen
        name="ProductosTab"
        component={ProductosStack}
        options={{
          tabBarLabel: 'Productos',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="tag" size={size} color={color} /> 
          ),
        }}
      />
      <Tab.Screen
        name="ProveedoresTab"
        component={ProveedoresStack} 
        options={{
          tabBarLabel: 'Proveedores',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="dropbox" size={size} color={color} /> 
          ),
        }}
      />
      <Tab.Screen
        name="ComprasTab" 
        component={ComprasStack} 
        options={{
          tabBarLabel: 'Compras',
          tabBarIcon: ({ color, size }) => (
            // Ícono de carrito de compras (sí existe)
            <AntDesign name="shoppingcart" size={size} color={color} /> 
          ),
        }}
      />
      <Tab.Screen
        name="VentasTab" 
        component={VentasStack} 
        options={{
          tabBarLabel: 'Ventas',
          tabBarIcon: ({ color, size }) => (
            // Ícono de tarjeta/pago (sí existe)
            <AntDesign name="creditcard" size={size} color={color} /> 
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ----------------------------------------------------------------------
// STACK PRINCIPAL (Login y Navegación Global)
// ----------------------------------------------------------------------

function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />

      <Stack.Screen 
        name="MainTabs" 
        component={MyTabs} 
        options={{ 
          title: 'Menú Principal',
          headerLeft: null 
        }} 
      />
    </Stack.Navigator>
  );
}

export default function Navegacion() {
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}