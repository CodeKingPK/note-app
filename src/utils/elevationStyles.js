import { Platform, Animated } from 'react-native';

/**
 * Utility to generate consistent elevation styles across iOS and Android platforms
 * 
 * @param {number} level - Elevation level from 1-24 (following Material Design elevation levels)
 * @param {string} [shadowColor='#000'] - Shadow color (iOS)
 * @param {Object} [options] - Additional options
 * @param {number} [options.offsetX] - Horizontal shadow offset
 * @param {number} [options.offsetY] - Vertical shadow offset
 * @param {number} [options.radius] - Custom shadow radius
 * @param {number} [options.opacity] - Custom shadow opacity
 * @param {string} [options.direction] - Shadow direction (top, bottom, left, right)
 * @param {number} [options.height] - Custom shadow height for directional shadows
 * @returns {Object} Platform-specific elevation styles
 */
export const getElevation = (level = 1, shadowColor = '#000', options = {}) => {
  // Normalize level between 1 and 24
  const normalizedLevel = Math.max(1, Math.min(24, Math.floor(level)));
  
  // Calculate relative values based on elevation level
  const shadowOpacity = options.opacity || Math.min(0.6, 0.03 * normalizedLevel + 0.06);
  const shadowRadius = options.radius || Math.min(24, normalizedLevel * 0.75 + 2);
  const androidElevation = normalizedLevel;
  
  // Default shadow offset scales with level but is capped
  let offsetX = options.offsetX || 0;
  let offsetY = options.offsetY || Math.min(normalizedLevel / 3, 3);
  
  // Apply directional shadows if specified
  if (options.direction) {
    const offset = options.height || normalizedLevel / 2;
    
    switch(options.direction) {
      case 'top':
        offsetY = -offset;
        break;
      case 'bottom':
        offsetY = offset;
        break;
      case 'left':
        offsetX = -offset;
        break;
      case 'right':
        offsetX = offset;
        break;
    }
  }
  
  return {
    ...Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: offsetX, height: offsetY },
        shadowOpacity,
        shadowRadius,
        zIndex: normalizedLevel,
      },
      android: {
        elevation: androidElevation,
        // Adding these properties improves shadow appearance on Android
        shadowColor,
        shadowOffset: { width: offsetX, height: offsetY / 2 },
        shadowOpacity: shadowOpacity * 0.8,
        shadowRadius: shadowRadius * 0.8,
      },
    }),
  };
};

/**
 * Generates more realistic card shadow with subtle border
 * 
 * @param {number} level - Elevation level 
 * @param {string} color - Shadow color
 * @param {Object} options - Additional options
 * @returns {Object} Card elevation styles
 */
export const getCardElevation = (level = 2, color = '#000', options = {}) => {
  const elevationStyle = getElevation(level, color, options);
  
  return {
    ...elevationStyle,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  };
};

/**
 * Creates a spotlight shadow effect (more intense in center, fading at edges)
 * 
 * @param {number} intensity - Shadow intensity (1-10)
 * @param {string} color - Shadow color
 * @returns {Object} Spotlight shadow styles
 */
export const getSpotlightShadow = (intensity = 5, color = '#000') => {
  const normalizedIntensity = Math.max(1, Math.min(10, intensity));
  
  return {
    ...Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: normalizedIntensity * 0.04,
        shadowRadius: normalizedIntensity * 5,
      },
      android: {
        elevation: normalizedIntensity,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: normalizedIntensity * 0.04,
        shadowRadius: normalizedIntensity * 3,
      },
    }),
  };
};

/**
 * Generates elevation styles for specific UI elements 
 */
export const elevationPresets = {
  // Card elevations
  card: {
    resting: getCardElevation(2),
    raised: getCardElevation(4),
    spotlight: getSpotlightShadow(4, '#1a73e8'),
  },
  
  // Dialog and modal elevations
  modal: getElevation(10, '#000', { radius: 16, opacity: 0.35 }),
  dialog: getElevation(8, '#000', { radius: 12, opacity: 0.25 }),
  
  // Floating action button
  fab: getElevation(6, '#1a73e8', { offsetY: 3, radius: 10, opacity: 0.35 }),
  
  // Action menu bottom sheet
  bottomSheet: getElevation(8, '#000', { direction: 'top', height: 4, opacity: 0.2 }),
  
  // Dropdowns and menus
  dropdown: getElevation(5, '#000', { radius: 8, opacity: 0.2 }),
  
  // Form elements
  inputField: getElevation(1, '#000', { opacity: 0.15 }),
  button: getElevation(2, '#000', { opacity: 0.2 }),
  
  // Header
  header: getElevation(3, '#000', { direction: 'bottom', height: 1.5, opacity: 0.1 }),
  
  // Navigation elements
  navigationBar: getElevation(4, '#000', { direction: 'bottom', opacity: 0.15 }),
  tabBar: getElevation(2, '#000', { direction: 'top', height: 1, opacity: 0.1 }),
  
  // Special effects
  innerShadow: {
    light: {
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
      backgroundColor: 'rgba(255,255,255,0.9)',
    },
    dark: {
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      backgroundColor: 'rgba(0,0,0,0.8)',
    }
  }
};

/**
 * Returns animated elevation styles for use with Animated.Value
 * 
 * @param {Animated.Value} animValue - Animation value between 0 and 1
 * @param {Object} options - Options for configuring the animation range
 * @returns {Object} Animated elevation styles
 */
export const getAnimatedElevation = (animValue, {
  minLevel = 1,
  maxLevel = 5,
  color = '#000'
} = {}) => {
  return {
    ...Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { 
          width: 0, 
          height: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [minLevel / 3, maxLevel / 3]
          })
        },
        shadowOpacity: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [Math.min(0.6, 0.03 * minLevel + 0.06), Math.min(0.6, 0.03 * maxLevel + 0.06)]
        }),
        shadowRadius: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [Math.min(24, minLevel * 0.75 + 2), Math.min(24, maxLevel * 0.75 + 2)]
        }),
      },
      android: {
        elevation: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [minLevel, maxLevel]
        }),
        shadowColor: color,
      },
    }),
  };
};

/**
 * Creates a shadow that follows the device tilt with a parallax effect
 * 
 * @param {Animated.ValueXY} tiltValue - Animation value for tilt (x, y)
 * @param {Object} options - Configuration options
 * @returns {Object} Animated styles for parallax shadow
 */
export const getTiltShadow = (tiltValue, { 
  baseLevel = 2,
  intensity = 5,
  color = '#000' 
} = {}) => {
  const tiltFactor = 2; // How much tilt affects the shadow
  
  return {
    ...Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: {
          width: Animated.multiply(tiltValue.x, tiltFactor),
          height: Animated.multiply(tiltValue.y, tiltFactor)
        },
        shadowOpacity: 0.2,
        shadowRadius: baseLevel * 2,
      },
      android: {
        elevation: baseLevel,
        // Android doesn't support animated shadow offsets as easily
      }
    })
  };
};

/**
 * Generates a complex multi-layered shadow for premium UI elements
 * 
 * @param {number} level - Base elevation level
 * @param {string} primaryColor - Primary shadow color
 * @param {string} accentColor - Accent shadow color for the glow effect
 * @returns {Array} Array of style objects to spread into a component
 */
export const getMultiLayerShadow = (level = 3, primaryColor = '#000', accentColor = '#1a73e8') => {
  return [
    // Base shadow - wider, softer
    getElevation(level, primaryColor, { radius: level * 2, opacity: 0.1 }),
    
    // Mid shadow - medium spread
    Platform.OS === 'ios' ? {
      shadowColor: primaryColor,
      shadowOffset: { width: 0, height: level / 2 },
      shadowOpacity: 0.15,
      shadowRadius: level,
    } : {},
    
    // Tight shadow - sharper edges
    Platform.OS === 'ios' ? {
      shadowColor: primaryColor,
      shadowOffset: { width: 0, height: level / 4 },
      shadowOpacity: 0.25,
      shadowRadius: level / 2,
    } : {},
    
    // Accent glow
    Platform.OS === 'ios' ? {
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: level * 3,
    } : {},
  ];
};
