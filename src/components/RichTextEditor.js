import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Animated,
  Platform,
  Easing,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

// Enhanced rich text editor with smooth animations
const RichTextEditor = ({ 
  value, 
  onChangeText, 
  placeholder = 'Start typing...',
  style 
}) => {
  const [currentStyles, setCurrentStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showToolbar, setShowToolbar] = useState(false);
  
  // Animation values
  const toolbarAnim = useRef(new Animated.Value(0)).current;
  const toolbarHeight = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef({});
  
  // Initialize button animations
  useEffect(() => {
    const buttons = ['bold', 'italic', 'underline', 'h1', 'h2', 'bullet', 'checklist'];
    buttons.forEach(btn => {
      buttonScaleAnim.current[btn] = new Animated.Value(1);
    });
  }, []);

  // Animate toolbar visibility
  useEffect(() => {
    if (showToolbar) {
      Animated.parallel([
        Animated.timing(toolbarAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false, // Using false because we animate height
        }),
        Animated.timing(toolbarHeight, {
          toValue: 56, // Toolbar height
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(toolbarAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(toolbarHeight, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        })
      ]).start();
    }
  }, [showToolbar]);

  // Handle button press animation
  const animateButtonPress = (buttonName) => {
    if (buttonScaleAnim.current[buttonName]) {
      Animated.sequence([
        Animated.timing(buttonScaleAnim.current[buttonName], {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.spring(buttonScaleAnim.current[buttonName], {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Apply formatting markers to the text
  const formatText = (formattingType) => {
    animateButtonPress(formattingType);
    const { start, end } = selection;
    
    if (start === end) {
      // No text selected, just toggle the current style
      setCurrentStyles({
        ...currentStyles,
        [formattingType]: !currentStyles[formattingType],
      });
      return;
    }
    
    // Text is selected, apply formatting
    const selectedText = value.substring(start, end);
    let newText = '';
    
    switch (formattingType) {
      case 'bold':
        newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
        break;
      case 'italic':
        newText = value.substring(0, start) + `_${selectedText}_` + value.substring(end);
        break;
      case 'underline':
        newText = value.substring(0, start) + `~${selectedText}~` + value.substring(end);
        break;
      case 'bullet':
        // Split selected text by newlines and add bullets
        const lines = selectedText.split('\n');
        const bulletedLines = lines.map(line => `• ${line}`).join('\n');
        newText = value.substring(0, start) + bulletedLines + value.substring(end);
        break;
      default:
        return;
    }
    
    onChangeText(newText);
  };

  // Add a header to the text
  const addHeader = (level) => {
    animateButtonPress(level === 1 ? 'h1' : 'h2');
    const { start, end } = selection;
    const selectedText = value.substring(start, end);
    
    // Determine line boundaries
    let lineStart = start;
    while (lineStart > 0 && value[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    let lineEnd = end;
    while (lineEnd < value.length && value[lineEnd] !== '\n') {
      lineEnd++;
    }
    
    // Get the line content
    const line = value.substring(lineStart, lineEnd);
    
    // Remove existing header markers
    const cleanLine = line.replace(/^#+\s/, '');
    
    // Create new header
    const headerMarker = '#'.repeat(level) + ' ';
    const newLine = headerMarker + cleanLine;
    
    // Replace the line in the text
    const newText = value.substring(0, lineStart) + newLine + value.substring(lineEnd);
    onChangeText(newText);
  };

  // Add a checklist item
  const addChecklistItem = () => {
    animateButtonPress('checklist');
    const { start } = selection;
    
    // Find the beginning of the line
    let lineStart = start;
    while (lineStart > 0 && value[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    // Insert checklist marker at the beginning of the line
    const newText = value.substring(0, lineStart) + '[ ] ' + value.substring(lineStart);
    onChangeText(newText);
  };

  // Render toolbar button with animation
  const renderToolbarButton = (iconName, onPress, isActive = false, buttonKey) => {
    const scaleValue = buttonScaleAnim.current[buttonKey] || new Animated.Value(1);
    
    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }]
        }}
      >
        <TouchableOpacity
          style={[
            styles.toolbarButton, 
            isActive && styles.activeToolbarButton,
            // Add subtle elevation to buttons
            Platform.select({
              ios: {
                shadowColor: isActive ? '#1a73e8' : '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isActive ? 0.3 : 0.1,
                shadowRadius: 2,
              },
              android: {
                elevation: isActive ? 3 : 1,
              },
            })
          ]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name={iconName} 
            size={20} 
            color={isActive ? '#fff' : '#555'} 
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // Render text button for headers
  const renderTextButton = (text, onPress, buttonKey) => {
    const scaleValue = buttonScaleAnim.current[buttonKey] || new Animated.Value(1);
    
    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }]
        }}
      >
        <TouchableOpacity
          style={[
            styles.toolbarButton,
            // Add subtle elevation to buttons
            Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              },
              android: {
                elevation: 1,
              },
            })
          ]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.headerButtonText}>{text}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Animatable.View 
        animation="fadeIn" 
        duration={600} 
        useNativeDriver
        style={{ flex: 1 }}
      >
        <TextInput
          style={styles.editor}
          multiline
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onSelectionChange={(event) => {
            setSelection(event.nativeEvent.selection);
            // Show toolbar when text is selected
            setShowToolbar(
              event.nativeEvent.selection.start !== event.nativeEvent.selection.end
            );
          }}
          textAlignVertical="top"
        />
      </Animatable.View>
      
      <Animated.View 
        style={[
          styles.toolbarContainer,
          {
            opacity: toolbarAnim,
            height: toolbarHeight,
            transform: [
              {
                translateY: toolbarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }
            ]
          }
        ]}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbar}
        >
          {renderToolbarButton(
            "format-bold", 
            () => formatText('bold'), 
            currentStyles.bold,
            'bold'
          )}
          
          {renderToolbarButton(
            "format-italic", 
            () => formatText('italic'), 
            currentStyles.italic,
            'italic'
          )}
          
          {renderToolbarButton(
            "format-underlined", 
            () => formatText('underline'), 
            currentStyles.underline,
            'underline'
          )}
          
          <View style={styles.divider} />
          
          {renderTextButton("H1", () => addHeader(1), 'h1')}
          {renderTextButton("H2", () => addHeader(2), 'h2')}
          
          <View style={styles.divider} />
          
          {renderToolbarButton(
            "format-list-bulleted", 
            () => formatText('bullet'),
            false,
            'bullet'
          )}
          
          {renderToolbarButton(
            "check-box", 
            addChecklistItem,
            false,
            'checklist'
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editor: {
    flex: 1,
    padding: 0,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  toolbarContainer: {
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  toolbar: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  toolbarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  activeToolbarButton: {
    backgroundColor: '#1a73e8',
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
});

export default RichTextEditor;
