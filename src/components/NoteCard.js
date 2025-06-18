import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import * as Animatable from 'react-native-animatable';  const NoteCard = ({ note, onPress, onLongPress }) => {
  const { title, content, createdAt, isPinned, color, category, tags, audioUri } = note;
  const [isPressed, setIsPressed] = useState(false);
    // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // Using state for elevation properties to avoid mixing drivers
  const [shadowOpacity, setShadowOpacity] = useState(0.15);
  const [shadowRadius, setShadowRadius] = useState(6);
  const [elevation, setElevation] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Truncate content if it's too long
  const truncatedContent = content.length > 100 
    ? content.substring(0, 100) + '...' 
    : content;
  const handlePressIn = () => {
    setIsPressed(true);
    setIsAnimating(true);
    // Animate scale down
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 7,
      tension: 40,
      useNativeDriver: true
    }).start();
    
    // Update elevation properties directly
    setShadowOpacity(0.06);
    setShadowRadius(3);
    setElevation(1);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    // Animate scale back up
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true
    }).start(() => {
      setIsAnimating(false);
    });
    
    // Update elevation properties directly
    setShadowOpacity(0.15);
    setShadowRadius(6);
    setElevation(3);
  };
    // Dynamic shadow based on state values
  const dynamicShadow = {
    ...Platform.select({
      ios: {
        shadowOpacity: shadowOpacity,
        shadowRadius: shadowRadius,
      },
      android: {
        elevation: elevation,
      },
    })
  };
    return (
    <Animatable.View
      animation="fadeInUp"
      duration={400}
      easing="ease-out-cubic"
      useNativeDriver
    >
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ scale: scaleAnim }],
            ...dynamicShadow
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.card, 
            { backgroundColor: color || '#ffffff' }
          ]}
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.95}
          delayPressIn={0}
        >
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {title || 'Untitled Note'}
            </Text>
            {isPinned && (
              <Animatable.View animation="fadeIn" duration={300} useNativeDriver>
                <MaterialIcons name="push-pin" size={18} color="#555" />
              </Animatable.View>
            )}
          </View>
          
          <Text style={styles.content} numberOfLines={5}>
            {truncatedContent}
          </Text>
            <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text style={styles.date}>
                {moment(createdAt).format('MMM D, YYYY')}
              </Text>
              
              {audioUri && (
                <Animatable.View 
                  animation="fadeIn" 
                  duration={300} 
                  useNativeDriver
                  style={styles.audioIndicator}
                >
                  <MaterialIcons name="mic" size={12} color="#1a73e8" />
                  <Text style={styles.audioIndicatorText}>Audio</Text>
                </Animatable.View>
              )}
            </View>
            
            {category && (
              <Animatable.View 
                animation="fadeIn" 
                duration={300} 
                useNativeDriver
                style={styles.category}
              >
                <Text style={styles.categoryText}>{category}</Text>
              </Animatable.View>
            )}
          </View>

          {tags && tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.slice(0, 3).map((tag, index) => (
                <Animatable.View 
                  key={index} 
                  style={styles.tag}
                  animation="fadeIn"
                  delay={index * 50}
                  duration={300}
                  useNativeDriver
                >
                  <Text style={styles.tagText}>#{tag}</Text>
                </Animatable.View>
              ))}
              {tags.length > 3 && (
                <Animatable.Text 
                  style={styles.moreTagsText}
                  animation="fadeIn"
                  delay={150}
                  duration={300}
                  useNativeDriver
                >
                  +{tags.length - 3}
                </Animatable.Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
      },
    }),
  },
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },  
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    color: '#333',
  },
  content: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    lineHeight: 22,
  },  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  audioIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 115, 232, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  audioIndicatorText: {
    fontSize: 10,
    color: '#1a73e8',
    fontWeight: '500',
    marginLeft: 3,
  },
  category: {
    backgroundColor: 'rgba(26, 115, 232, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#1a73e8',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },  
  tag: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 6,
    marginTop: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#1a73e8',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#888',
    marginLeft: 4,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default NoteCard;
