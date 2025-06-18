import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
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
import * as Animatable from 'react-native-animatable';
import VoiceRecorder from '../components/VoiceRecorder';

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
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            deleteNote(noteId);
            navigation.goBack();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${note.title}\n\n${note.content}`,
        title: note.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share note');
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

        {note.audioUri && (
          <Animatable.View 
            style={styles.audioPlayerContainer}
            animation="fadeInUp"
            duration={500}
            delay={400}
            easing="ease-out-cubic"
            useNativeDriver
          >
            <Text style={styles.audioLabel}>Voice Recording</Text>
            <VoiceRecorder 
              audioUri={note.audioUri} 
              onRecordingComplete={(uri) => {
                // Update note with new recording if user re-records
                if (uri) {
                  updateNote(note.id, { audioUri: uri });
                }
              }}
            />
          </Animatable.View>
        )}
      </ScrollView>      <Animatable.View 
        style={styles.footer}
        animation="fadeInUp"
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
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={note.isArchived ? "unarchive" : "archive"}
            size={20}
            color={note.isArchived ? "#e67700" : "#1a73e8"}
          />
          <Text style={[
            styles.archiveButtonText,
            note.isArchived ? styles.unarchiveButtonText : {}
          ]}>
            {note.isArchived ? "Unarchive" : "Archive"}
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    // Add safe area insets to avoid status bar overlap
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40, // Increased top margin to avoid status bar
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },  backButton: {
    padding: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 10,
    marginLeft: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },contentContainer: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 120 : 90, // Increased to ensure content starts below header
  },
  scrollContent: {
    paddingBottom: 80, // Increased to add more space at the bottom
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
    letterSpacing: -0.5,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryContainer: {
    backgroundColor: 'rgba(26, 115, 232, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    ...getElevation(1),
  },
  categoryText: {
    fontSize: 13,
    color: '#1a73e8',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    ...getElevation(1),
  },
  tagText: {
    fontSize: 12,
    color: '#1a73e8',
    fontWeight: '500',
  },
  content: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
    letterSpacing: 0.2,
  },
  audioPlayerContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    ...getElevation(2),
  },
  audioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },  footer: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
    paddingBottom: Platform.OS === 'ios' ? 25 : 16,
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(26, 115, 232, 0.08)',
    borderRadius: 12,
    // Improve elevation with more pronounced shadow
    ...Platform.select({
      ios: {
        shadowColor: '#1a73e8',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
        borderWidth: 0.5,
        borderColor: 'rgba(26, 115, 232, 0.2)',
      },
    }),
  },archiveButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '500',
  },
  unarchiveButton: {
    backgroundColor: 'rgba(230, 119, 0, 0.08)',
  },
  unarchiveButtonText: {
    color: '#e67700',
  },
});

export default NoteDetailScreen;
