import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { getElevation } from '../utils/elevationStyles';

const EmptyState = ({ type, message, subMessage, onPress }) => {  // Animation references
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Use state for shadow properties to avoid mixing drivers
  const [shadowOpacity, setShadowOpacity] = useState(0.2);
  const [shadowRadius, setShadowRadius] = useState(10);
  const [elevationLevel, setElevationLevel] = useState(3);
  useEffect(() => {
    // Setup floating animation - smoother with spring physics
    Animated.loop(
      Animated.sequence([
        Animated.spring(floatAnim, {
          toValue: 1,
          friction: 6,
          tension: 15,
          useNativeDriver: true
        }),
        Animated.spring(floatAnim, {
          toValue: 0,
          friction: 6,
          tension: 15,
          useNativeDriver: true
        })
      ])
    ).start();

    // Setup shadow glow animation with state
    const shadowInterval = setInterval(() => {
      setShadowOpacity((prev) => prev === 0.2 ? 0.6 : 0.2);
      setShadowRadius((prev) => prev === 10 ? 24 : 10);
      setElevationLevel((prev) => prev === 3 ? 8 : 3);
    }, 2000);
    
    // Setup subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1800,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true
        })
      ])
    ).start();
    
    // Setup subtle rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();    return () => {
      // Cleanup animations
      floatAnim.stopAnimation();
      pulseAnim.stopAnimation();
      rotateAnim.stopAnimation();
      clearInterval(shadowInterval);
    };
  }, []);

  const renderIcon = () => {
    const iconColor = '#1a73e8';
    let iconName;
    
    switch (type) {
      case 'search':
        iconName = "search";
        break;
      case 'archived':
        iconName = "archive";
        break;
      case 'category':
        iconName = "category";
        break;
      case 'note':
      default:
        iconName = "note";
        break;
    }    // Enhanced dynamic shadow based on state
    const shadowStyle = {
      ...Platform.select({
        ios: {
          shadowOpacity: shadowOpacity,
          shadowRadius: shadowRadius,
          shadowColor: '#1a73e8'
        },
        android: {
          elevation: elevationLevel,
        },
      })
    };

    // Calculate rotation transform for subtle rotating effect
    const rotateInterpolation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['-3deg', '3deg']
    });

    return (
      <Animated.View
        style={[
          styles.iconOuterContainer,
          {
            transform: [
              {
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -12]
                })
              },
              {
                rotate: rotateInterpolation
              },
              {
                scale: pulseAnim
              }
            ],
            ...shadowStyle
          }
        ]}
      >
        <Animatable.View 
          animation="zoomIn" 
          duration={800}
          easing="ease-out-cubic" 
          useNativeDriver
          style={styles.iconContainer}
        >
          <MaterialIcons name={iconName} size={64} color={iconColor} />
        </Animatable.View>
      </Animated.View>
    );
  };

  const content = (
    <Animatable.View 
      style={styles.container}
      animation="fadeIn"
      duration={800}
      easing="ease-out-cubic"
      useNativeDriver
    >
      {renderIcon()}
      <Animatable.Text 
        style={styles.message}
        animation="fadeInUp"
        delay={300}
        duration={800}
        easing="ease-out-cubic"
        useNativeDriver
      >
        {message || 'No notes found'}
      </Animatable.Text>
      {subMessage && (
        <Animatable.Text 
          style={styles.subMessage}
          animation="fadeInUp"
          delay={500}
          duration={800}
          easing="ease-out-cubic"
          useNativeDriver
        >
          {subMessage}
        </Animatable.Text>
      )}
    </Animatable.View>
  );

  // Make the empty state interactive if onPress is provided
  if (onPress) {
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        {content}
      </TouchableWithoutFeedback>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 40,
  },
  iconOuterContainer: {
    margin: 10,
    ...getElevation(5, '#1a73e8', {
      radius: 15,
      opacity: 0.3,
      height: 4
    }),
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(26, 115, 232, 0.2)',
    overflow: 'hidden',
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 16,
    color: '#777',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '80%',
  },
});

export default EmptyState;
