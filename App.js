import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NoteProvider } from './src/context/NoteContext';
import 'react-native-gesture-handler';
import * as Animatable from 'react-native-animatable';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import elevation utilities
import { getElevation, elevationPresets } from './src/utils/elevationStyles';

// Define custom transition animations with improved physics
const customTransitionSpec = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

// Additional transition options for modals and detail views
const modalTransitionSpec = {
  animation: 'spring',
  config: {
    stiffness: 300,
    damping: 30,
    mass: 1,
    overshootClamping: false,
    restSpeedThreshold: 0.01,
    restDisplacementThreshold: 0.01,
  },
};

// Custom screen transition effects
const fadeTransition = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <NoteProvider>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: '#ffffff',
              ...elevationPresets.header,
            },
            headerTintColor: '#333',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
            contentStyle: {
              backgroundColor: '#f8f9fa',
            },
            animation: 'slide_from_right',
            animationDuration: 300,
            transitionSpec: {
              open: customTransitionSpec,
              close: customTransitionSpec,
            },
            cardStyleInterpolator: ({ current, next, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                    {
                      scale: next
                        ? next.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0.93],
                          })
                        : 1,
                    },
                    {
                      rotateY: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['5deg', '0deg'],
                      })
                    }
                  ],
                  opacity: current.progress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 0.9, 1],
                  }),
                },
                overlayStyle: {
                  opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.5],
                  }),
                },
              };
            },
            headerShown: true,
            // Add subtle gesture response
            gestureEnabled: true,
            gestureResponseDistance: {
              horizontal: 300
            },
            gestureVelocityImpact: 0.4,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              title: 'Notes',
              headerRight: () => (
                <Animatable.View
                  animation="fadeIn"
                  duration={600}
                  useNativeDriver
                  style={{ marginRight: 4 }} // Add additional margin for the container
                >
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={() => navigation.navigate('Settings')}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}  // Increase touch area
                  >
                    <MaterialIcons name="more-vert" size={24} color="#333" />
                  </TouchableOpacity>
                </Animatable.View>
              ),
            })}
          />
          <Stack.Screen
            name="NoteEditor"
            component={NoteEditorScreen}
            options={({ route }) => ({
              title: route.params?.noteId ? 'Edit Note' : 'New Note',
              headerShown: false,
            })}
          />
          <Stack.Screen
            name="NoteDetail"
            component={NoteDetailScreen}
            options={{
              title: 'Note Details',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
            }}
          />
        </Stack.Navigator>
      </NoteProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8, // Add margin to move it away from edge
    borderRadius: 20,
    backgroundColor: '#f5f5f5', // Light background for better visibility
    ...getElevation(2),
  },
});
