import { Platform } from 'react-native';

// Format date from ISO string to readable format
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString(undefined, options);
};

// Get a color based on the category
export const getCategoryColor = (category) => {
  const colors = {
    'Personal': '#ffcccc',  // Light Red
    'Work': '#b3e0ff',      // Light Blue
    'Ideas': '#ffffcc',     // Light Yellow
    'To-Do': '#ccffcc',     // Light Green
    'Shopping': '#ffccff',  // Light Purple
    'Health': '#ccffff',    // Light Cyan
    'Finance': '#e6ccff',   // Light Violet
    'Travel': '#ffd9b3',    // Light Orange
  };
  
  return colors[category] || '#ffffff';  // Default to white if category not found
};

// Convert text to searchable format (lowercase, no accents)
export const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Extract tags from content (words prefixed with #)
export const extractTagsFromContent = (content) => {
  const matches = content.match(/#[\w-]+/g);
  if (!matches) return [];
  
  // Remove # and return unique tags
  return [...new Set(matches.map(tag => tag.slice(1)))];
};

// Simple content summarizer (first 100 chars or first paragraph)
export const summarizeContent = (content) => {
  if (!content) return '';
  
  // Try to get first paragraph
  const firstParagraph = content.split('\n\n')[0];
  
  if (firstParagraph.length <= 100) {
    return firstParagraph;
  }
  
  // Otherwise return first 100 chars
  return content.substring(0, 100) + '...';
};

// Check if device is using iOS
export const isIOS = Platform.OS === 'ios';

// Generate a random pastel color
export const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 100%, 85%)`;
};

// Sort notes by different criteria
export const sortNotes = (notes, sortBy = 'updatedAt') => {
  const sortedNotes = [...notes];
  
  switch (sortBy) {
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
