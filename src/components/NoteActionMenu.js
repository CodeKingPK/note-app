import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  Easing,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';

const { height, width } = Dimensions.get('window');

const NoteActionMenu = ({ 
  visible, 
  onClose, 
  note, 
  onPin, 
  onArchive, 
  onDelete, 
  onShare, 
  onEdit 
}) => {  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const actionItemOpacity = useRef(new Animated.Value(0)).current;
  const actionItemTranslateY = useRef(new Animated.Value(20)).current;
  
  // Use state for shadow properties to avoid mixing drivers
  const [shadowOpacityValue, setShadowOpacityValue] = useState(0);
  const [shadowRadiusValue, setShadowRadiusValue] = useState(0);
  const [elevationValue, setElevationValue] = useState(0);
  const [actionItems, setActionItems] = useState([]);

  useEffect(() => {
    if (visible) {
      // Prepare action items with appropriate delays
      setActionItems([
        {
          icon: note.isPinned ? 'push-pin' : 'outlined-flag',
          text: note.isPinned ? 'Unpin' : 'Pin',
          onPress: onPin,
          color: '#333',
          delay: 0
        },
        {
          icon: 'edit',
          text: 'Edit',
          onPress: onEdit,
          color: '#333',
          delay: 50
        },
        {
          icon: 'share',
          text: 'Share',
          onPress: onShare,
          color: '#333',
          delay: 100
        },
        {
          icon: note.isArchived ? 'unarchive' : 'archive',
          text: note.isArchived ? 'Unarchive' : 'Archive',
          onPress: onArchive,
          color: '#333',
          delay: 150
        },
        {
          icon: 'delete-outline',
          text: 'Delete',
          onPress: onDelete,
          color: '#f44336',
          delay: 200
        }
      ]);

      // Animate backdrop opacity
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }).start();
      
      // Animate menu sliding up with spring physics
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 12,
        restSpeedThreshold: 10,
        restDisplacementThreshold: 0.01,
      }).start();
        // Animate shadow fading using state
      setShadowOpacityValue(0.15);
      setShadowRadiusValue(10);
      setElevationValue(12);
      
      // Animate action items appearing with a slight delay
      Animated.timing(actionItemOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }).start();
      
      Animated.timing(actionItemTranslateY, {
        toValue: 0,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5))
      }).start();
    } else {
      // Animate menu sliding down faster
      Animated.timing(translateY, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }).start();
      
      // Animate backdrop fading out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
        // Animate shadow fading using state
      setShadowOpacityValue(0);
      setShadowRadiusValue(0);
      setElevationValue(0);
      
      // Reset action item animations
      actionItemOpacity.setValue(0);
      actionItemTranslateY.setValue(20);
    }
  }, [visible, note]);

  if (!note) return null;
    // Dynamic shadow based on state
  const dynamicShadow = {
    ...Platform.select({
      ios: {
        shadowOpacity: shadowOpacityValue,
        shadowRadius: shadowRadiusValue,
      },
      android: {
        elevation: elevationValue,
      },
    })
  };
  
  const renderActionItem = (item, index) => {
    const { icon, text, onPress, color, delay } = item;
    
    return (
      <Animatable.View
        key={`${icon}-${index}`}
        animation="fadeInUp"
        duration={400}
        delay={delay}
        useNativeDriver
      >
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Animated.View 
            style={[
              styles.actionIconContainer,
              {
                transform: [
                  { 
                    scale: Animated.spring({
                      toValue: 1.1,
                      friction: 5,
                      tension: 40,
                      useNativeDriver: true
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.actionIcon}>
              <MaterialIcons name={icon} size={24} color={color} />
            </View>
          </Animated.View>
          <Text style={[styles.actionText, { color }]}>{text}</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View 
            style={[
              styles.overlay,
              { opacity }
            ]}
          />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.menuContainer,
            { 
              transform: [{ translateY }],
              ...dynamicShadow
            }
          ]}
        >
          <Animatable.View 
            animation="fadeIn" 
            duration={300} 
            useNativeDriver
            style={styles.handleContainer}
          >
            <View style={styles.handle} />
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeIn" 
            duration={400} 
            useNativeDriver
            style={styles.header}
          >
            <Text style={styles.title} numberOfLines={1}>
              {note.title || 'Untitled Note'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <View>
                <MaterialIcons name="close" size={24} color="#333" />
              </View>
            </TouchableOpacity>
          </Animatable.View>
          
          <View style={styles.actionContainer}>
            {actionItems.map(renderActionItem)}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  handleContainer: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ddd',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIconContainer: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  actionIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  actionText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
});

export default NoteActionMenu;
