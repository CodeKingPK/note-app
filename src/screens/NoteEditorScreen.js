import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text, 
  ScrollView,
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
import NoteDeleteModal from '../components/NoteDeleteModal';
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
  const [useRichTextEditor, setUseRichTextEditor] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
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
        message: `${title}\n\n${content}`,
        title: title || 'Note',
      });
    } catch (error) {
      console.error('Error sharing note:', error);
    }
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

        {!isKeyboardVisible && (
          <View style={styles.footer}>
            <View style={styles.footerButtons}>
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
                  {useRichTextEditor ? "Simple Editor" : "Rich Text"}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.footerText}>
              {noteId ? 'Last edited: Today' : 'New note'}
            </Text>
          </View>
        )}

        <NoteDeleteModal
          visible={deleteModalVisible}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          noteTitle={title}
        />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
    marginTop: Platform.OS === 'ios' ? 44 : 25,
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
  optionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    backgroundColor: 'rgba(255,255,255,0.98)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(26, 115, 232, 0.2)',
  },
  footerButtonText: {
    fontSize: 15,
    color: '#1a73e8',
    marginLeft: 10,
    fontWeight: '600',
  },
});

export default NoteEditorScreen;
