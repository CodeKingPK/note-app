import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotes } from '../context/NoteContext';
import { formatDate } from '../utils/helpers';
import { getElevation } from '../utils/elevationStyles';
import NoteDeleteModal from '../components/NoteDeleteModal';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const NoteDetailScreen = ({ navigation, route }) => {
  const { noteId } = route.params;  const {
    notes,
    deleteNote,
    togglePinNote,
    toggleArchiveNote,
    updateNote,
  } = useNotes();

  const note = notes.find((n) => n.id === noteId);

  if (!note) {
    navigation.goBack();
    return null;
  }
  // Animation references
  const scrollViewRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [headerOpacity, setHeaderOpacity] = useState(1);
  // Native driver animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  // JS driver animations (separate from native driver animations)
  const shadowAnim = useRef(new Animated.Value(1)).current;
  // State for shadow properties to avoid mixing drivers
  const [shadowOpacity, setShadowOpacity] = useState(0.3);
  const [shadowRadius, setShadowRadius] = useState(8);
  const [elevationLevel, setElevationLevel] = useState(4);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleScroll = (event) => {
    const position = event.nativeEvent.contentOffset.y;
    setScrollPosition(position);
    
    // Fade header based on scroll position with smoother transition
    if (position < 80) {
      setHeaderOpacity(1 - (position / 80));
      
      // Parallax effect for header
      headerTranslateY.setValue(-position * 0.3);
    } else {
      setHeaderOpacity(0);
    }
  };

  const handleEdit = () => {
    navigation.navigate('NoteEditor', { noteId });
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    deleteNote(noteId);
    setDeleteModalVisible(false);
    navigation.goBack();
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${note.title}\n\n${note.content}`,
        title: note.title,
      });
    } catch (error) {
      console.error('Error sharing note:', error);
    }
  };

  const handleTogglePin = () => {
    // Add spring animation when toggling pin
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
    
    togglePinNote(noteId);
  };  const handleToggleArchive = () => {
    // Use state updates instead of animated values for shadow
    setShadowOpacity(0.1);
    setShadowRadius(3);
    setElevationLevel(1);
    
    // Add a timeout to simulate animation
    setTimeout(() => {
      toggleArchiveNote(noteId);
      if (!note.isArchived) {
        // If we're archiving, go back to home
        navigation.goBack();
      } else {
        // If we're unarchiving, restore the shadow
        setShadowOpacity(0.3);
        setShadowRadius(8);
        setElevationLevel(4);
      }
    }, 300);
  };
  
  useEffect(() => {
    // Configure status bar properly
    StatusBar.setBarStyle('dark-content');
    // On Android, set translucent status bar for better appearance
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
    
    // Initial animations when screen loads
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
    
    // Set initial shadow values based on archive status
    if (note.isArchived) {
      setShadowOpacity(0.1);
      setShadowRadius(3);
      setElevationLevel(1);
    } else {
      setShadowOpacity(0.3);
      setShadowRadius(8);
      setElevationLevel(4);
    }
      return () => {
      // Reset status bar when leaving screen
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
      }
    };
  }, []);
  // Calculate shadow based on state values
  const dynamicShadow = {
    ...Platform.select({
      ios: {
        shadowOpacity: shadowOpacity,
        shadowRadius: shadowRadius,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: elevationLevel,
      },
    })
  };
  
  // Helper function to create button animation
  const createButtonAnimation = (delay = 0) => {
    return {
      animation: "fadeIn", 
      delay, 
      duration: 400,
      easing: "ease-out-cubic",
      useNativeDriver: true
    };
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: note.color || '#ffffff',
          transform: [{ scale: scaleAnim }],
        },
        dynamicShadow
      ]}
    >
      <Animated.View 
        style={[
          styles.header, 
          { 
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <Animatable.View {...createButtonAnimation(100)}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleTogglePin}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={note.isPinned ? "push-pin" : "outlined-flag"}
                size={24}
                color="#333"
              />
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View {...createButtonAnimation(150)}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <MaterialIcons name="share" size={24} color="#333" />
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View {...createButtonAnimation(200)}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={24} color="#333" />
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View {...createButtonAnimation(250)}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <MaterialIcons name="delete-outline" size={24} color="#333" />
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.contentContainer}
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animatable.Text 
          style={styles.title}
          animation="fadeInUp"
          duration={500}
          delay={100}
          easing="ease-out-cubic"
          useNativeDriver
        >
          {note.title || 'Untitled Note'}
        </Animatable.Text>

        <Animatable.View 
          style={styles.metaContainer}
          animation="fadeInUp"
          duration={500}
          delay={200}
          easing="ease-out-cubic"
          useNativeDriver
        >
          {note.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{note.category}</Text>
            </View>
          )}
          <Text style={styles.dateText}>
            {formatDate(note.updatedAt)}
          </Text>
        </Animatable.View>

        {note.tags && note.tags.length > 0 && (
          <Animatable.View 
            style={styles.tagsContainer}
            animation="fadeInUp"
            duration={500}
            delay={250}
            easing="ease-out-cubic"
            useNativeDriver
          >
            {note.tags.map((tag, index) => (
              <Animatable.View 
                key={index} 
                style={styles.tag}
                animation="fadeInRight"
                delay={300 + (index * 50)}
                duration={400}
                easing="ease-out-cubic"
                useNativeDriver
              >
                <Text style={styles.tagText}>#{tag}</Text>
              </Animatable.View>
            ))}
          </Animatable.View>
        )}

        <Animatable.Text 
          style={styles.content}
          animation="fadeInUp"
          duration={600}
          delay={350}
          easing="ease-out-cubic"
          useNativeDriver
        >
          {note.content}
        </Animatable.Text>
      </ScrollView>

      <Animatable.View 
        style={styles.footer}
        animation="slideInUp"
        duration={500}
        delay={400}
        easing="ease-out-cubic"
        useNativeDriver
      >
        <TouchableOpacity
          style={[
            styles.archiveButton,
            note.isArchived ? styles.unarchiveButton : {}
          ]}
          onPress={handleToggleArchive}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={note.isArchived ? "unarchive" : "archive"}
            size={20}
            color={note.isArchived ? "#ff9800" : "#1a73e8"}
          />
          <Text style={[
            styles.archiveButtonText,
            note.isArchived ? styles.unarchiveButtonText : {}
          ]}>
            {note.isArchived ? "Unarchive Note" : "Archive Note"}
          </Text>
        </TouchableOpacity>
      </Animatable.View>

      <NoteDeleteModal
        visible={deleteModalVisible}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        noteTitle={note.title}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 130 : 100,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    color: '#1a1a1a',
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  categoryContainer: {
    backgroundColor: 'rgba(26, 115, 232, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    ...getElevation(2),
  },
  categoryText: {
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 28,
  },
  tag: {
    backgroundColor: 'rgba(26, 115, 232, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(26, 115, 232, 0.2)',
  },
  tagText: {
    fontSize: 13,
    color: '#1a73e8',
    fontWeight: '600',
  },
  content: {
    fontSize: 17,
    lineHeight: 28,
    color: '#2c2c2c',
    letterSpacing: 0.3,
    fontWeight: '400',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
    }),
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(26, 115, 232, 0.2)',
  },
  archiveButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#1a73e8',
    fontWeight: '600',
  },
  unarchiveButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: 'rgba(255, 152, 0, 0.2)',
  },
  unarchiveButtonText: {
    color: '#ff9800',
  },
});

export default NoteDetailScreen;
