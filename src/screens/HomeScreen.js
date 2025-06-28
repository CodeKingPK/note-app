import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  TextInput,
  ActivityIndicator,
  Share,
  Platform,
  Dimensions,
  Animated,
  Easing,
  StatusBar
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNotes } from '../context/NoteContext';
import NoteCard from '../components/NoteCard';
import EmptyState from '../components/EmptyState';
import NoteActionMenu from '../components/NoteActionMenu';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useNoteSearch } from '../utils/useNoteSearch';
import * as Animatable from 'react-native-animatable';
import { getElevation } from '../utils/elevationStyles';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { 
    notes, 
    categories, 
    isLoading,
    togglePinNote,
    toggleArchiveNote,
    deleteNote
  } = useNotes();
  
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortCriteria,
    setSortCriteria,
    filteredNotes,
    clearSearch
  } = useNoteSearch();

  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  // Animation references
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabRotate = useRef(new Animated.Value(0)).current;
  const searchBarWidth = useRef(new Animated.Value(width - 32)).current;
  const searchFocused = useRef(false);
  
  // Setup animation interpolations
  const fabRotation = fabRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });
  
  // Animation handlers
  const animateFabIn = () => {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 1.1,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.timing(fabRotate, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1)
      })
    ]).start();
  };
  
  const animateFabOut = () => {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.timing(fabRotate, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1)
      })
    ]).start();
  };
  
  const focusSearchBar = () => {
    if (!searchFocused.current) {
      searchFocused.current = true;
      Animated.spring(searchBarWidth, {
        toValue: width - 80,
        friction: 8,
        tension: 60,
        useNativeDriver: false
      }).start();
    }
  };
  
  const blurSearchBar = () => {
    if (searchFocused.current && !searchQuery) {
      searchFocused.current = false;
      Animated.spring(searchBarWidth, {
        toValue: width - 32,
        friction: 8,
        tension: 60,
        useNativeDriver: false
      }).start();
    }
  };

  const handleNotePress = (noteId) => {
    navigation.navigate('NoteDetail', { noteId });
  };

  const handleNoteLongPress = (note) => {
    // Add haptic feedback later if desired
    setSelectedNote(note);
    setActionMenuVisible(true);
  };

  const handleShare = async () => {
    if (!selectedNote) return;
    
    try {
      await Share.share({
        message: `${selectedNote.title}\n\n${selectedNote.content}`,
        title: selectedNote.title || 'Note',
      });
    } catch (error) {
      console.error('Error sharing note:', error);
    }
    
    setActionMenuVisible(false);
  };

  const handlePinToggle = () => {
    if (selectedNote) {
      togglePinNote(selectedNote.id);
      setActionMenuVisible(false);
    }
  };

  const handleArchiveToggle = () => {
    if (selectedNote) {
      toggleArchiveNote(selectedNote.id);
      setActionMenuVisible(false);
    }
  };

  const handleEdit = () => {
    if (selectedNote) {
      navigation.navigate('NoteEditor', { noteId: selectedNote.id });
      setActionMenuVisible(false);
    }
  };

  const handleDelete = () => {
    if (selectedNote) {
      setActionMenuVisible(false);
      setDeleteModalVisible(true);
    }
  };

  const confirmDelete = () => {
    if (selectedNote) {
      deleteNote(selectedNote.id);
      setDeleteModalVisible(false);
      setSelectedNote(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
  };

  const renderCategoryItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInRight"
      duration={400}
      delay={100 + (index * 50)}
      easing="ease-out-cubic"
      useNativeDriver
    >
      <TouchableOpacity
        style={[
          styles.categoryItem,
          selectedCategory === item && styles.selectedCategoryItem,
        ]}
        onPress={() => setSelectedCategory(item)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.categoryText,
            selectedCategory === item && styles.selectedCategoryText,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderSortOption = (option, label, index) => (
    <Animatable.View
      animation="fadeIn"
      duration={400}
      delay={200 + (index * 50)}
      easing="ease-out-cubic"
      useNativeDriver
    >
      <TouchableOpacity
        style={[
          styles.sortOption,
          sortCriteria === option && styles.selectedSortOption,
        ]}
        onPress={() => setSortCriteria(option)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.sortOptionText,
            sortCriteria === option && styles.selectedSortOptionText,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
  
  const renderItem = ({ item, index }) => {
    return (
      <Animatable.View
        animation="fadeInUp"
        duration={400}
        delay={index * 50}
        easing="ease-out-cubic"
        useNativeDriver
      >
        <NoteCard
          note={item}
          onPress={() => handleNotePress(item.id)}
          onLongPress={() => handleNoteLongPress(item)}
        />
      </Animatable.View>
    );
  };

  useEffect(() => {
    // Set status bar
    StatusBar.setBarStyle('dark-content');
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Animatable.Text 
          animation="fadeIn" 
          duration={1000}
          style={styles.loadingText}
        >
          Loading your notes...
        </Animatable.Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animatable.View 
        animation="fadeInDown" 
        duration={600}
        easing="ease-out-cubic"
        useNativeDriver
        style={styles.header}
      >
        <Animated.View style={[styles.searchBar, { width: searchBarWidth }]}>
          <MaterialIcons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
            onFocus={focusSearchBar}
            onBlur={blurSearchBar}
          />
          {searchQuery ? (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <MaterialIcons name="close" size={20} color="#888" />
            </TouchableOpacity>
          ) : null}
        </Animated.View>
        
        {searchFocused.current && (
          <Animatable.View
            animation="fadeIn"
            duration={200}
            useNativeDriver
          >
            <TouchableOpacity 
              onPress={() => {
                blurSearchBar();
                clearSearch();
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Animatable.View>
        )}
      </Animatable.View>

      <Animatable.View 
        animation="fadeInLeft" 
        duration={500}
        delay={100}
        useNativeDriver
        style={styles.categoriesContainer}
      >
        <FlatList
          data={['All', 'Archived', ...categories]}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </Animatable.View>

      <Animatable.View 
        animation="fadeInLeft" 
        duration={500}
        delay={150}
        useNativeDriver
        style={styles.sortContainer}
      >
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortOptions}>
          {renderSortOption('updatedAt', 'Recent', 0)}
          {renderSortOption('createdAt', 'Created', 1)}
          {renderSortOption('title', 'Title', 2)}
        </View>
      </Animatable.View>
      
      <FlatList
        data={filteredNotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState 
            type={searchQuery ? 'search' : selectedCategory === 'Archived' ? 'archived' : 'note'} 
            message={
              searchQuery 
                ? "No matching notes found" 
                : selectedCategory === 'Archived'
                ? "No archived notes"
                : "No notes found"
            }
            subMessage={
              searchQuery
                ? "Try a different search term"
                : "Tap the + button to create a note"
            }
            onPress={searchQuery ? () => clearSearch() : null}
          />
        }
      />
      
      <Animated.View 
        style={[
          styles.fab,
          {
            transform: [
              { scale: fabScale },
              { rotate: fabRotation }
            ]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('NoteEditor')}
          onPressIn={animateFabIn}
          onPressOut={animateFabOut}
          activeOpacity={0.8}
          style={styles.fabTouchable}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>
      
      <NoteActionMenu
        visible={actionMenuVisible}
        onClose={() => setActionMenuVisible(false)}
        note={selectedNote}
        onPin={handlePinToggle}
        onArchive={handleArchiveToggle}
        onDelete={handleDelete}
        onShare={handleShare}
        onEdit={handleEdit}
      />
      
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        noteTitle={selectedNote?.title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    ...getElevation(2),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f3f5',
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: '#e1e2e3',
    ...getElevation(1),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  cancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  cancelText: {
    color: '#1a73e8',
    fontWeight: '500',
    fontSize: 15,
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f2f3f5',
    marginRight: 8,
    ...getElevation(1),
  },
  selectedCategoryItem: {
    backgroundColor: '#1a73e8',
    ...getElevation(2, '#1a73e8', { opacity: 0.3 }),
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
    marginRight: 10,
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  selectedSortOption: {
    backgroundColor: '#e8f0fe',
    ...getElevation(1, '#1a73e8', { opacity: 0.2 }),
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  selectedSortOptionText: {
    color: '#1a73e8',
    fontWeight: '600',
  },  notesList: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 110 : 140, // Extra padding for FAB to prevent content from being hidden
  },fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a73e8',
    right: 24,
    bottom: Platform.OS === 'ios' ? 50 : 72, // Increased to avoid overlap with nav buttons
    justifyContent: 'center',
    alignItems: 'center',
    ...getElevation(4, '#1a73e8', { opacity: 0.4, radius: 10 }),
  },
  fabTouchable: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 30,
    color: '#ffffff',
    fontWeight: 'bold',
    lineHeight: 36,
    textAlign: 'center',
  },
});

export default HomeScreen;
