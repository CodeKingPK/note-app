# 📝 Smart Notes

A beautiful, feature-rich note-taking app built with React Native and Expo. Organize your thoughts, ideas, and important information with a modern, intuitive interface.

<div align="center">
  <img src="./assets/icon.png" alt="Smart Notes Logo" width="120" height="120" />
</div>

## ✨ Features

### 📖 Core Note-Taking
- **Rich Text Editor**: Create formatted notes with bold, italic, and structured text
- **Quick Actions**: Pin, edit, share, delete, and archive notes with intuitive gestures
- **Smart Search**: Find notes instantly with intelligent search functionality
- **Categories**: Organize notes into custom categories for better organization

### 🎨 Beautiful Design
- **Modern UI**: Clean, Material Design-inspired interface
- **Smooth Animations**: Fluid transitions and delightful micro-interactions
- **Responsive Layout**: Optimized for both phones and tablets
- **Dark Mode Ready**: Designed with light interface and room for future dark mode

### 🚀 Advanced Features
- **Persistent Storage**: All notes saved securely using AsyncStorage
- **Custom Modals**: Consistent, beautiful confirmation dialogs
- **Gesture Support**: Swipe and touch gestures for enhanced UX
- **Cross-Platform**: Works seamlessly on iOS, Android, and Web

## 📱 Screenshots

*Screenshots will be added after building the production app*

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v7 with Native Stack
- **Animations**: React Native Animatable + Reanimated
- **Storage**: AsyncStorage for persistent data
- **Icons**: React Native Vector Icons (Material Icons)
- **State Management**: React Context API
- **Styling**: React Native StyleSheet with custom elevation utilities

## 📦 Dependencies

### Core Dependencies
- `expo` - The Expo framework for React Native
- `react-native` - The React Native framework
- `@react-navigation/native` - Navigation library
- `@react-native-async-storage/async-storage` - Local storage
- `react-native-vector-icons` - Icon library
- `react-native-animatable` - Animation library

### Development Tools
- `@babel/core` - JavaScript compiler
- Expo CLI tools for development and building

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS development: Xcode (macOS only)
- For Android development: Android Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CodeKingPK/note-app.git
   cd note-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   ```bash
   # iOS (requires macOS and Xcode)
   npm run ios
   
   # Android (requires Android Studio setup)
   npm run android
   
   # Web browser
   npm run web
   ```

### Development Setup

The app uses Expo's managed workflow, which means you can develop and test without needing to set up native development environments initially.

For development, you can:
- Use Expo Go app on your phone to scan the QR code
- Use iOS Simulator (macOS) or Android Emulator
- Run in web browser for quick testing

## 🏗️ Project Structure

```
smart-notes-app/
├── assets/                    # App icons and static assets
│   ├── icon.png              # Main app icon
│   ├── adaptive-icon.png     # Android adaptive icon
│   ├── splash-icon.png       # Splash screen icon
│   ├── favicon.png           # Web favicon
│   └── manifest.json         # Web app manifest
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── NoteCard.js       # Individual note display
│   │   ├── NoteEditor.js     # Note editing interface
│   │   ├── RichTextEditor.js # Rich text editing component
│   │   ├── NoteActionMenu.js # Note action bottom sheet
│   │   ├── EmptyState.js     # Empty state illustrations
│   │   ├── DeleteConfirmationModal.js # Delete confirmation
│   │   ├── NoteDeleteModal.js # Note-specific delete modal
│   │   └── CategoryDeleteModal.js # Category delete modal
│   ├── screens/              # Main app screens
│   │   ├── HomeScreen.js     # Main notes listing
│   │   ├── NoteEditorScreen.js # Note creation/editing
│   │   ├── NoteDetailScreen.js # Full note viewing
│   │   └── SettingsScreen.js # App settings and about
│   ├── context/              # State management
│   │   └── NoteContext.js    # Global notes state
│   └── utils/                # Helper functions and utilities
│       ├── elevationStyles.js # Material Design elevation
│       ├── helpers.js        # Date formatting and utilities
│       ├── useNoteSearch.js  # Search functionality hook
│       └── uuid-polyfill.js  # UUID generation
├── App.js                    # Main app component
├── app.json                  # Expo configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🎯 Key Components

### NoteContext
Centralized state management for all notes, categories, and app state using React Context API.

### Custom Modals
Beautiful, consistent modal components that replace native alerts for better UX:
- Delete confirmation modals
- Category management modals
- Note-specific action modals

### Animation System
Smooth, physics-based animations using:
- React Native Animatable for entrance/exit animations
- Custom spring animations for interactions
- Gesture-responsive animations

### Search System
Intelligent search functionality that searches through:
- Note titles
- Note content
- Categories
- Creation dates

## 🎨 Design System

### Color Palette
- **Primary**: #2196F3 (Material Blue)
- **Background**: #f8f9fa (Light Gray)
- **Surface**: #ffffff (White)
- **Text Primary**: #333333 (Dark Gray)
- **Text Secondary**: #666666 (Medium Gray)

### Typography
- **Headers**: 600 weight, 18-24px sizes
- **Body**: 400 weight, 16px size
- **Captions**: 400 weight, 14px size

### Elevation System
Custom elevation utilities providing Material Design shadows:
- Cards: 2dp elevation
- FAB: 6dp elevation
- Headers: 4dp elevation
- Modals: 8dp elevation

## 🔧 Building for Production

### Android APK

1. **Configure app signing**
   ```bash
   expo build:android
   ```

2. **Generate keystore** (first time)
   ```bash
   expo credentials:manager
   ```

3. **Build APK**
   ```bash
   expo build:android -t apk
   ```

### iOS App Store

1. **Configure certificates**
   ```bash
   expo build:ios
   ```

2. **Build for App Store**
   ```bash
   expo build:ios -t archive
   ```

### Expo Application Services (EAS)

For more advanced builds:
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for production
eas build --platform android
eas build --platform ios
```

## 📝 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `expo build:android` - Build Android APK
- `expo build:ios` - Build iOS archive

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow React Native and Expo best practices
- Use consistent code formatting
- Add meaningful commit messages
- Test on multiple platforms before submitting
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Pritam Karmakar**
- GitHub: [@CodeKingPK](https://github.com/CodeKingPK)
- Email: Your email here

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development platform
- **React Native Community** - For the robust ecosystem
- **Material Design** - For the design inspiration
- **Contributors** - For helping improve the app

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/CodeKingPK/note-app/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🔮 Future Enhancements

- 🌙 Dark mode support
- 🔄 Cloud synchronization
- 📎 File attachments
- 🏷️ Advanced tagging system
- 📊 Note statistics and insights
- 🔐 Note encryption for privacy
- 🎙️ Voice notes and transcription
- 📱 Widget support
- 🌐 Collaborative editing

---

<div align="center">
  <p>Made with ❤️ by Pritam Karmakar</p>
  <p>⭐ Star this repo if you like it!</p>
</div>
