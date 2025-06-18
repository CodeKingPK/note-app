import { useState, useEffect } from 'react';
import { useNotes } from '../context/NoteContext';

/**
 * Custom hook for searching and filtering notes
 * @param {string} initialQuery - Initial search query
 * @param {string} initialCategory - Initial category filter
 * @param {string} initialSortBy - Initial sort criteria
 * @returns {Object} - Search state and functions
 */
export const useNoteSearch = (
  initialQuery = '',
  initialCategory = 'All',
  initialSortBy = 'updatedAt'
) => {
  const { notes, searchNotes, getNotesByCategory } = useNotes();
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortCriteria, setSortCriteria] = useState(initialSortBy);
  const [filteredNotes, setFilteredNotes] = useState([]);
  
  // Filter and sort notes whenever dependencies change
  useEffect(() => {
    let results = [];
    
    // First filter by search query if present
    if (searchQuery.trim()) {
      results = searchNotes(searchQuery);
    } else {
      // Otherwise filter by category
      results = getNotesByCategory(selectedCategory);
    }
    
    // Sort the filtered results
    results = sortNotesByType(results, sortCriteria);
    
    setFilteredNotes(results);
  }, [notes, searchQuery, selectedCategory, sortCriteria, searchNotes, getNotesByCategory]);
  
  // Sort notes by criteria and always keep pinned notes at top
  const sortNotesByType = (notesToSort, criteria) => {
    const sortedNotes = [...notesToSort];
    
    switch (criteria) {
      case 'title':
        sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'createdAt':
        sortedNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'updatedAt':
      default:
        sortedNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
    }
    
    // Always keep pinned notes at top
    return sortedNotes.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortCriteria,
    setSortCriteria,
    filteredNotes,
    clearSearch
  };
};
