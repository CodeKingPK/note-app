import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../utils/uuid-polyfill'; // Import the polyfill
import { v4 as uuidv4 } from 'uuid';

const NoteContext = createContext();

export const useNotes = () => useContext(NoteContext);

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState(['Personal', 'Work', 'Ideas', 'To-Do']);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from storage on app start
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await AsyncStorage.getItem('notes');
        const storedCategories = await AsyncStorage.getItem('categories');
        
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        }
        
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  // Save notes to storage whenever they change
  useEffect(() => {
    const saveNotes = async () => {
      try {
        await AsyncStorage.setItem('notes', JSON.stringify(notes));
      } catch (error) {
        console.error('Failed to save notes:', error);
      }
    };

    if (!isLoading) {
      saveNotes();
    }
  }, [notes, isLoading]);

  // Save categories to storage whenever they change
  useEffect(() => {
    const saveCategories = async () => {
      try {
        await AsyncStorage.setItem('categories', JSON.stringify(categories));
      } catch (error) {
        console.error('Failed to save categories:', error);
      }
    };

    if (!isLoading) {
      saveCategories();
    }
  }, [categories, isLoading]);
  // Add a new note
  const addNote = (title, content, category = 'Personal', color = '#ffffff', audioUri = null) => {
    const newNote = {
      id: uuidv4(),
      title,
      content,
      category,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isArchived: false,
      tags: [],
      audioUri
    };

    setNotes([newNote, ...notes]);
    return newNote.id;
  };

  // Update an existing note
  const updateNote = (id, updates) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  };

  // Delete a note
  const deleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  // Pin/Unpin a note
  const togglePinNote = (id) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  // Archive/Unarchive a note
  const toggleArchiveNote = (id) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? { ...note, isArchived: !note.isArchived, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  // Add a tag to a note
  const addTagToNote = (noteId, tag) => {
    setNotes(
      notes.map((note) =>
        note.id === noteId && !note.tags.includes(tag)
          ? {
              ...note,
              tags: [...note.tags, tag],
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  };

  // Remove a tag from a note
  const removeTagFromNote = (noteId, tag) => {
    setNotes(
      notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              tags: note.tags.filter((t) => t !== tag),
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  };

  // Add a new category
  const addCategory = (category) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  // Remove a category
  const removeCategory = (category) => {
    setCategories(categories.filter((c) => c !== category));
    // Update notes with this category to use 'Personal' instead
    setNotes(
      notes.map((note) =>
        note.category === category
          ? { ...note, category: 'Personal', updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  // Search notes by title, content, tags
  const searchNotes = (query) => {
    if (!query.trim()) return notes;
    
    const searchTerm = query.toLowerCase().trim();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
  };

  // Filter notes by category
  const getNotesByCategory = (category) => {
    if (category === 'All') return notes.filter(note => !note.isArchived);
    if (category === 'Archived') return notes.filter(note => note.isArchived);
    return notes.filter(note => note.category === category && !note.isArchived);
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        categories,
        isLoading,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        toggleArchiveNote,
        addTagToNote,
        removeTagFromNote,
        addCategory,
        removeCategory,
        searchNotes,
        getNotesByCategory,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
