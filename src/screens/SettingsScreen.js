import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotes } from '../context/NoteContext';
import CategoryDeleteModal from '../components/CategoryDeleteModal';
import * as Animatable from 'react-native-animatable';
import { getElevation } from '../utils/elevationStyles';

const SettingsScreen = () => {
  const { categories, addCategory, removeCategory } = useNotes();
  const [newCategory, setNewCategory] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // Auto-save interval setting
  const [autoSaveInterval, setAutoSaveInterval] = useState(30); // seconds
  
  // Animation values for interval controls
  const intervalButtonScale = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(intervalButtonScale, {
      toValue: 0.95,
      friction: 5,
      tension: 300,
      useNativeDriver: true
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(intervalButtonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const handleAddCategory = () => {
    const trimmedCategory = newCategory.trim();
    
    if (!trimmedCategory) {
      console.log('Category name cannot be empty');
      return;
    }
    
    if (categories.includes(trimmedCategory)) {
      console.log('Category already exists');
      // You could add a toast notification here
      return;
    }
    
    if (trimmedCategory.length > 20) {
      console.log('Category name too long (max 20 characters)');
      return;
    }
    
    addCategory(trimmedCategory);
    setNewCategory('');
    console.log(`Category "${trimmedCategory}" added successfully`);
  };

  const handleDeleteCategory = (category) => {
    if (['Personal', 'Work', 'Ideas', 'To-Do'].includes(category)) {
      // Could add a toast notification here
      console.log('Cannot delete default categories');
      return;
    }

    setCategoryToDelete(category);
    setDeleteModalVisible(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      removeCategory(categoryToDelete);
      setDeleteModalVisible(false);
      setCategoryToDelete(null);
    }
  };

  const cancelDeleteCategory = () => {
    setDeleteModalVisible(false);
    setCategoryToDelete(null);
  };

  const renderSettingItem = (icon, title, description, component, index = 0) => (
    <Animatable.View 
      animation="fadeInUp"
      delay={index * 100}
      duration={400}
      easing="ease-out-cubic"
      useNativeDriver
      style={styles.settingItem}
    >
      <View style={styles.settingIconContainer}>
        <MaterialIcons name={icon} size={24} color="#2196F3" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      {component}
    </Animatable.View>
  );

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Animatable.View 
        animation="fadeIn" 
        duration={500}
        useNativeDriver
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>Auto Save</Text>
        {renderSettingItem(
          'save',
          'Auto Save Interval',
          `Save notes automatically every ${autoSaveInterval} seconds`,
          <View style={styles.intervalControl}>
            <Animated.View style={{ transform: [{ scale: intervalButtonScale }] }}>
              <TouchableOpacity
                style={styles.intervalButton}
                onPress={() => autoSaveInterval > 5 && setAutoSaveInterval(autoSaveInterval - 5)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.7}
              >
                <MaterialIcons name="remove" size={18} color="#555" />
              </TouchableOpacity>
            </Animated.View>
            <Animatable.Text 
              animation="pulse" 
              iterationCount="infinite" 
              duration={2000}
              useNativeDriver
              style={styles.intervalText}
            >
              {autoSaveInterval}s
            </Animatable.Text>
            <Animated.View style={{ transform: [{ scale: intervalButtonScale }] }}>
              <TouchableOpacity
                style={styles.intervalButton}
                onPress={() => setAutoSaveInterval(autoSaveInterval + 5)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.7}
              >
                <MaterialIcons name="add" size={18} color="#555" />
              </TouchableOpacity>
            </Animated.View>
          </View>,
          0
        )}
      </Animatable.View>

      <Animatable.View 
        animation="fadeIn" 
        duration={500}
        delay={100}
        useNativeDriver
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesSubtitle}>
            Manage note categories ({categories.length})
          </Text>
        </View>

        <Animatable.View 
          animation="fadeInUp"
          duration={600}
          delay={200}
          useNativeDriver
          style={styles.addCategoryContainer}
        >
          <TextInput
            style={styles.addCategoryInput}
            placeholder="Add new category..."
            placeholderTextColor="#999"
            value={newCategory}
            onChangeText={setNewCategory}
            onSubmitEditing={handleAddCategory}
            maxLength={20}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={handleAddCategory}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </Animatable.View>

        <View style={styles.categoriesListContainer}>
          {categories.map((item, index) => (
            <Animatable.View 
              key={item}
              animation="fadeInRight"
              duration={400}
              delay={300 + (index * 50)}
              useNativeDriver
              style={styles.categoryItem}
            >
              <View style={styles.categoryIcon}>
                <MaterialIcons name="label" size={20} color="#2196F3" />
              </View>
              <Text style={styles.categoryName}>{item}</Text>
              <TouchableOpacity
                style={styles.categoryDeleteButton}
                onPress={() => handleDeleteCategory(item)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={20}
                  color={
                    ['Personal', 'Work', 'Ideas', 'To-Do'].includes(item)
                      ? '#ccc'
                      : '#ff9800'
                  }
                />
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
      </Animatable.View>

      <Animatable.View 
        animation="fadeIn" 
        duration={500}
        delay={200}
        useNativeDriver
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>About</Text>
        {renderSettingItem(
          'info',
          'App Version',
          'Smart Notes v1.0.0',
          null,
          1
        )}
        {renderSettingItem(
          'smartphone',
          'Platform',
          'Built with React Native',
          null,
          2
        )}
        {renderSettingItem(
          'person',
          'Developer',
          'Pritam Karmakar',
          null,
          3
        )}
        {renderSettingItem(
          'build',
          'Build',
          'Release 2025.06.28',
          null,
          4
        )}
        {renderSettingItem(
          'favorite',
          'Support',
          'Rate us on App Store',
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />,
          5
        )}
      </Animatable.View>

      <Animatable.View 
        animation="fadeIn" 
        duration={500}
        delay={250}
        useNativeDriver
        style={styles.creditSection}
      >
        <View style={styles.creditContainer}>
          <MaterialIcons name="code" size={32} color="#2196F3" style={styles.creditIcon} />
          <View style={styles.creditContent}>
            <Text style={styles.creditTitle}>Developed by</Text>
            <Text style={styles.creditName}>Pritam Karmakar</Text>
            <Text style={styles.creditSubtitle}>Full Stack Developer</Text>
          </View>
        </View>
        
        <View style={styles.creditFooter}>
          <Text style={styles.creditFooterText}>
            Made with ❤️ for better note-taking experience
          </Text>
        </View>
      </Animatable.View>

      <CategoryDeleteModal
        visible={deleteModalVisible}
        onClose={cancelDeleteCategory}
        onConfirm={confirmDeleteCategory}
        categoryName={categoryToDelete}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginLeft: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    ...getElevation(1),
    marginBottom: 1,
  },
  settingIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  intervalControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    ...getElevation(2),
  },
  intervalText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    width: 34,
    textAlign: 'center',
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoriesSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  addCategoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  addCategoryInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginRight: 12,
    ...getElevation(1),
  },
  addCategoryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    ...getElevation(3),
  },
  categoriesListContainer: {
    marginBottom: 8,
  },
  categoriesList: {
    maxHeight: 220,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    ...getElevation(1),
    marginBottom: 2,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  categoryIcon: {
    width: 30,
    alignItems: 'center',
    marginRight: 16,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  categoryDeleteButton: {
    padding: 8,
  },
  creditSection: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  creditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    ...getElevation(3),
  },
  creditIcon: {
    marginRight: 16,
  },
  creditContent: {
    flex: 1,
  },
  creditTitle: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    marginBottom: 4,
  },
  creditName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 2,
  },
  creditSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  creditFooter: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    ...getElevation(2),
  },
  creditFooterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SettingsScreen;
