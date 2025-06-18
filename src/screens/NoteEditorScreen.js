import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text, 
  ScrollView,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Share,
  Animated,
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotes } from '../context/NoteContext';
import NoteEditor from '../components/NoteEditor';
import VoiceRecorder from '../components/VoiceRecorder';
import RichTextEditor from '../components/RichTextEditor';
import * as Animatable from 'react-native-animatable';

const NoteEditorScreen = ({ navigation, route }) => {
  const { noteId } = route.params || {};
  const { 
    notes, 
    categories, 
    addNote, 
    updateNote, 
    deleteNote,
    togglePinNote 
  } = useNotes();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [category, setCategory] = useState('Personal');
  const [tags, setTags] = useState([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [useRichTextEditor, setUseRichTextEditor] = useState(false);
  
  // Animation values
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const optionsScale = useRef(new Animated.Value(0)).current;
  const optionsOpacity = useRef(new Animated.Value(0)).current;
  
  // Load note data if editing existing note
  useEffect(() => {
    if (noteId) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setColor(note.color || '#ffffff');
        setCategory(note.category || 'Personal');
        setTags(note.tags || []);
        setIsPinned(note.isPinned || false);
        if (note.isRichText) {
          setUseRichTextEditor(true);
        }
      }
    }
    
    // Set status bar
    StatusBar.setBarStyle('dark-content');
    
    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        fadeOutHeader();
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        fadeInHeader();
      }
    );
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      StatusBar.setBarStyle('dark-content');
    };
  }, [noteId]);
  
  const fadeOutHeader = () => {
    Animated.timing(headerOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  const fadeInHeader = () => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  const toggleOptions = () => {
    if (!isOptionsVisible) {
      setIsOptionsVisible(true);
      Animated.parallel([
        Animated.spring(optionsScale, {
          toValue: 1,
          tension: 70,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(optionsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(optionsScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(optionsOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsOptionsVisible(false);
      });
    }
  };
  
  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      navigation.goBack();
      return;
    }

    if (noteId) {
      // Update existing note
      updateNote(noteId, {
        title,
        content,
        color,
        category,
        tags,
        isPinned,
      });
    } else {
      // Create new note
      addNote(title, content, category, color);
    }

    navigation.goBack();
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
        message: `${title}\n\n${content}`,
        title: title || 'Note',
      });
    } catch (error) {
      console.error('Error sharing note:', error);
    }
  };

  const handleVoiceRecordingComplete = (uri) => {
    // In a real app, you'd store the audio file and add a player
    // For now, we'll just add a note about the recording
    const timestamp = new Date().toLocaleTimeString();
    const newContent = content + `\n\n[Voice recording - ${timestamp}]\n`;
    setContent(newContent);
    setShowVoiceRecorder(false);
  };

  const handleTogglePin = () => {
    if (noteId) {
      togglePinNote(noteId);
      setIsPinned(!isPinned);
    } else {
      setIsPinned(!isPinned);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: color }]}>
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleSave}
          >
            <MaterialIcons name="arrow-back" size={24} color="#555" />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleTogglePin}
            >
              <MaterialIcons 
                name={isPinned ? "push-pin" : "outlined-flag"} 
                size={24} 
                color="#555" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={24} color="#555" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={toggleOptions}
            >
              <MaterialIcons 
                name={isOptionsVisible ? "expand-less" : "expand-more"} 
                size={24} 
                color="#555" 
              />
            </TouchableOpacity>
            
            {noteId && (
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={handleDelete}
              >
                <MaterialIcons name="delete-outline" size={24} color="#555" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <ScrollView 
          style={styles.editorContainer}
          keyboardShouldPersistTaps="handled"
        >
          {useRichTextEditor ? (
            <RichTextEditor
              value={content}
              onChangeText={setContent}
              style={{ flex: 1, padding: 16 }}
            />
          ) : (
            <NoteEditor
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              color={color}
              setColor={setColor}
              category={category}
              setCategory={setCategory}
              categories={categories}
              tags={tags}
              setTags={setTags}
              showOptions={isOptionsVisible}
            />
          )}
        </ScrollView>

        {showVoiceRecorder && (
          <VoiceRecorder onRecordingComplete={handleVoiceRecordingComplete} />
        )}

        {!isKeyboardVisible && (
          <View style={styles.footer}>
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => setShowVoiceRecorder(!showVoiceRecorder)}
              >
                <MaterialIcons 
                  name={showVoiceRecorder ? "mic-off" : "mic"} 
                  size={20} 
                  color="#555" 
                />
                <Text style={styles.footerButtonText}>
                  {showVoiceRecorder ? "Cancel" : "Voice"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => setUseRichTextEditor(!useRichTextEditor)}
              >
                <MaterialIcons 
                  name={useRichTextEditor ? "format-clear" : "text-format"} 
                  size={20} 
                  color="#555" 
                />
                <Text style={styles.footerButtonText}>
                  {useRichTextEditor ? "Simple" : "Rich Text"}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.footerText}>
              {noteId ? 'Last edited: Today' : 'New note'}
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  footerButtonText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
});

export default NoteEditorScreen;
