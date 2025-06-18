import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  Animated, 
  Easing, 
  Platform 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { getElevation } from '../utils/elevationStyles';

const ColorPicker = ({ selectedColor, onSelectColor }) => {
  const colors = [
    '#ffffff', // White
    '#f28b82', // Light Red
    '#fbbc04', // Light Orange
    '#fff475', // Light Yellow
    '#ccff90', // Light Green
    '#a7ffeb', // Light Teal
    '#cbf0f8', // Light Blue
    '#aecbfa', // Light Purple
    '#d7aefb', // Light Violet
    '#fdcfe8', // Light Pink
  ];

  // Animation reference for selected color
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleColorSelect = (color) => {
    // Animate the scale when a color is selected
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
    
    onSelectColor(color);
  };

  return (
    <Animatable.View 
      style={styles.colorPickerContainer}
      animation="fadeIn"
      duration={400}
      useNativeDriver
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {colors.map((color, index) => (
          <Animatable.View
            key={color}
            animation="fadeInRight" 
            delay={index * 30}
            duration={300}
            useNativeDriver
          >
            <TouchableOpacity
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
              onPress={() => handleColorSelect(color)}
              activeOpacity={0.7}
            >
              {selectedColor === color && (
                <Animatable.View 
                  animation="fadeIn"
                  duration={300}
                  style={styles.selectedColorCheck}
                  useNativeDriver
                >
                  <MaterialIcons 
                    name="check" 
                    size={16} 
                    color={color === '#ffffff' ? '#555' : '#fff'} 
                  />
                </Animatable.View>
              )}
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </ScrollView>
    </Animatable.View>
  );
};

const CategoryPicker = ({ categories, selectedCategory, onSelectCategory }) => {
  // Create animation refs for each category
  const animRefs = useRef({});
  
  // Initialize animation refs if needed
  if (Object.keys(animRefs.current).length === 0) {
    categories.forEach(category => {
      animRefs.current[category] = new Animated.Value(1);
    });
  }
  
  const handleCategorySelect = (category) => {
    // Animate the selected category
    Animated.sequence([
      Animated.timing(animRefs.current[category], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }),
      Animated.spring(animRefs.current[category], {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
    
    onSelectCategory(category);
  };

  return (
    <Animatable.View 
      style={styles.categoryPickerContainer}
      animation="fadeIn"
      duration={400}
      delay={100}
      useNativeDriver
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category, index) => {
          const isSelected = selectedCategory === category;
          const scaleAnim = animRefs.current[category] || new Animated.Value(1);
          
          return (
            <Animatable.View
              key={category}
              animation="fadeInRight"
              delay={index * 30}
              duration={300}
              useNativeDriver
            >
              <Animated.View
                style={[
                  {
                    transform: [{ scale: scaleAnim }],
                    ...getElevation(isSelected ? 3 : 1, isSelected ? '#1a73e8' : '#000')
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    isSelected && styles.selectedCategory,
                  ]}
                  onPress={() => handleCategorySelect(category)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.selectedCategoryText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </Animatable.View>
          );
        })}
      </ScrollView>
    </Animatable.View>
  );
};

const NoteEditor = ({
  title,
  setTitle,
  content,
  setContent,
  color,
  setColor,
  category,
  setCategory,
  categories,
  tags,
  setTags,
  showOptions,
}) => {
  const [newTag, setNewTag] = useState('');
  const addButtonScale = useRef(new Animated.Value(1)).current;

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      // Animate button press
      Animated.sequence([
        Animated.timing(addButtonScale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.spring(addButtonScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true
        })
      ]).start();
      
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Animatable.View
        animation="fadeIn"
        duration={400}
        useNativeDriver
      >
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
          multiline
        />
      </Animatable.View>

      <Animatable.View
        animation="fadeIn"
        duration={600}
        delay={100}
        useNativeDriver
        style={{ flex: 1 }}
      >
        <TextInput
          style={styles.contentInput}
          placeholder="Start typing..."
          value={content}
          onChangeText={setContent}
          placeholderTextColor="#999"
          multiline
        />
      </Animatable.View>

      {showOptions && (
        <Animatable.View
          animation="fadeInUp"
          duration={500}
          useNativeDriver
        >
          <ColorPicker selectedColor={color} onSelectColor={setColor} />
          
          <CategoryPicker
            categories={categories}
            selectedCategory={category}
            onSelectCategory={setCategory}
          />
          
          <View style={styles.tagsContainer}>
            <Animatable.View 
              animation="fadeIn"
              duration={400}
              delay={200}
              useNativeDriver
              style={styles.tagInputContainer}
            >
              <TextInput
                style={styles.tagInput}
                placeholder="Add tag..."
                value={newTag}
                onChangeText={setNewTag}
                placeholderTextColor="#999"
                onSubmitEditing={handleAddTag}
              />
              <Animated.View
                style={{
                  transform: [{ scale: addButtonScale }],
                  ...getElevation(2)
                }}
              >
                <TouchableOpacity 
                  onPress={handleAddTag} 
                  style={styles.addTagButton}
                  activeOpacity={0.8}
                >
                  <View>
                    <MaterialIcons name="add" size={18} color="#555" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </Animatable.View>
            
            <View style={styles.tagsList}>
              {tags.map((tag, index) => (
                <Animatable.View 
                  key={tag}
                  animation="fadeInRight"
                  duration={300}
                  delay={index * 50}
                  useNativeDriver
                  style={[
                    styles.tagItem,
                    getElevation(1)
                  ]}
                >
                  <Text style={styles.tagItemText}>#{tag}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTag(tag)}
                    style={styles.removeTagButton}
                    activeOpacity={0.8}
                  >
                    <View>
                      <MaterialIcons name="close" size={14} color="#777" />
                    </View>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </View>
          </View>
        </Animatable.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    padding: 0,
  },
  contentInput: {
    fontSize: 16,
    flex: 1,
    textAlignVertical: 'top',
    padding: 0,
    lineHeight: 22,
  },
  colorPickerContainer: {
    marginVertical: 16,
  },
  colorOption: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    ...getElevation(1),
  },
  selectedColorCheck: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  categoryPickerContainer: {
    marginBottom: 16,
  },
  categoryOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 4,
  },
  selectedCategory: {
    backgroundColor: '#1a73e8',
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  tagsContainer: {
    marginTop: 8,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    ...getElevation(1),
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 115, 232, 0.08)',
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  tagItemText: {
    fontSize: 13,
    color: '#1a73e8',
    marginRight: 6,
    fontWeight: '500',
  },
  removeTagButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NoteEditor;
