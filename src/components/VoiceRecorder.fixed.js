import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
  Easing,
  Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';
import { Slider } from 'react-native-paper';

const VoiceRecorder = ({ onRecordingComplete, audioUri }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState(null);
  // Playback states
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [playbackTimer, setPlaybackTimer] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const recordingEntryAnim = useRef(new Animated.Value(0)).current;
  const sliderAnim = useRef(new Animated.Value(1)).current;
  
  // Use state for shadow properties
  const [buttonShadowOpacity, setButtonShadowOpacity] = useState(0.35);
  const [buttonShadowRadius, setButtonShadowRadius] = useState(8);
  const [buttonElevation, setButtonElevation] = useState(8);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        // Just set states to null without trying to stop the recording again
        setIsRecording(false);
        setRecording(null);
      }
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      // Unload sound object if it exists
      if (sound) {
        sound.unloadAsync();
      }
      if (playbackTimer) {
        clearInterval(playbackTimer);
      }
    };
  }, [recording, recordingTimer, sound, playbackTimer]);
  
  // Start animations when recording
  useEffect(() => {
    let pulseAnimation;
    let waveAnimation;
    
    if (isRecording) {
      // Entry animation for recording UI
      Animated.timing(recordingEntryAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }).start();
      
      // Pulse animation for record button
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      // Wave animation
      waveAnimation = Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      
      pulseAnimation.start();
      waveAnimation.start();
    } else {
      // Reset animations
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(waveAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(recordingEntryAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    
    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
      if (waveAnimation) {
        waveAnimation.stop();
      }
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleButtonPressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.9,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    // Update shadow properties directly
    setButtonShadowOpacity(0.2);
    setButtonShadowRadius(4);
    setButtonElevation(4);
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    // Update shadow properties directly
    setButtonShadowOpacity(0.35);
    setButtonShadowRadius(8);
    setButtonElevation(8);
  };
  
  const startRecording = async () => {
    try {
      // If already recording, stop it first
      if (isRecording) {
        await stopRecording();
      }
      
      // Reset states to ensure clean start
      setRecording(null);
      setRecordingDuration(0);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }

      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'You need to grant microphone permissions to record audio notes.');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      
      setRecordingTimer(timer);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      // Reset states
      setIsRecording(false);
      setRecording(null);
    }
  };
  
  const stopRecording = async () => {
    try {
      // Check if recording exists and is in active state
      if (!recording) {
        setIsRecording(false);
        setRecordingDuration(0);
        return;
      }

      // Stop timer first
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }

      // Set UI state to not recording before attempting to stop
      setIsRecording(false);
      
      let uri = null;
      try {
        // Wrap this in its own try-catch to handle recording errors
        await recording.stopAndUnloadAsync();
        uri = recording.getURI();
      } catch (stopError) {
        console.log('Recording may have already been stopped:', stopError);
        // Continue execution even if stopping fails
      }
      
      // If duration is too short, discard
      if (recordingDuration < 1) {
        setRecording(null);
        setRecordingDuration(0);
        return;
      }

      // Pass recording to parent if we have a URI
      if (uri && onRecordingComplete) {
        onRecordingComplete(uri);
      }

      // Reset state
      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to stop recording', error);
      // Don't show alert to improve user experience, just reset state
      setIsRecording(false);
      setRecording(null);
      setRecordingDuration(0);
    }
  };
  
  // Load sound file
  const loadSound = async (uri) => {
    try {
      // Unload previous sound if it exists
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Load the sound file
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      
      // Set initial duration if available
      if (status.durationMillis) {
        setPlaybackDuration(Math.floor(status.durationMillis / 1000));
      }
      
      return newSound;
    } catch (error) {
      console.error('Failed to load sound', error);
      Alert.alert('Error', 'Failed to load recording');
      return null;
    }
  };
  
  // Handle playback status updates
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      // Update position
      if (status.positionMillis !== undefined) {
        setPlaybackPosition(Math.floor(status.positionMillis / 1000));
      }
      
      // Update duration if it changed
      if (status.durationMillis && Math.floor(status.durationMillis / 1000) !== playbackDuration) {
        setPlaybackDuration(Math.floor(status.durationMillis / 1000));
      }
      
      // Update playing state
      setIsPlaying(status.isPlaying);
      
      // Animate waveform based on playback
      if (status.isPlaying) {
        // Subtle pulse animation for the slider
        Animated.sequence([
          Animated.timing(sliderAnim, {
            toValue: 1.03,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(sliderAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
        
        Animated.loop(
          Animated.sequence([
            Animated.timing(waveAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(waveAnim, {
              toValue: 0.3,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        // Stop animation when paused
        waveAnim.stopAnimation();
        Animated.timing(waveAnim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
      
      // Handle playback completion
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
        
        // Clear timer if it exists
        if (playbackTimer) {
          clearInterval(playbackTimer);
          setPlaybackTimer(null);
        }
      }
    }
  };
  
  // Configure audio session for playback
  const configureAudioSession = async (playInBackground = false) => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: playInBackground, // Allow background playback
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  };
  
  // Play the recording
  const playRecording = async () => {
    try {
      // If there's no sound loaded but we have an audioUri, load it
      let currentSound = sound;
      if (!currentSound && audioUri) {
        currentSound = await loadSound(audioUri);
        if (!currentSound) return; // Loading failed
      }
      
      if (!currentSound) {
        Alert.alert('Error', 'No recording available to play');
        return;
      }
      
      // Configure audio session for playback
      await configureAudioSession(true); // Enable background playback
      
      // Check if sound is already playing
      const status = await currentSound.getStatusAsync();
      
      if (status.isPlaying) {
        // Pause the sound
        await currentSound.pauseAsync();
        setIsPlaying(false);
        
        // Clear timer if it exists
        if (playbackTimer) {
          clearInterval(playbackTimer);
          setPlaybackTimer(null);
        }
      } else {
        // If we've reached the end, start from the beginning
        if (status.positionMillis === status.durationMillis) {
          await currentSound.setPositionAsync(0);
        }
        
        // Play the sound
        await currentSound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play recording', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };
  
  // Seek to position in recording
  const seekToPosition = async (value) => {
    try {
      if (sound) {
        // Convert seconds to milliseconds
        const positionMillis = Math.floor(value * 1000);
        await sound.setPositionAsync(positionMillis);
        setPlaybackPosition(value);
      }
    } catch (error) {
      console.error('Failed to seek in recording', error);
    }
  };
  
  // Change playback rate
  const changePlaybackRate = async (rate) => {
    try {
      if (sound) {
        // Valid values: 0.5, 0.75, 1.0, 1.25, 1.5, 2.0
        await sound.setRateAsync(rate, true); // true = keep pitch correct
        setPlaybackRate(rate);
      }
    } catch (error) {
      console.error('Failed to change playback rate', error);
    }
  };

  // Change volume
  const changeVolume = async (value) => {
    try {
      if (sound) {
        await sound.setVolumeAsync(value);
        setVolume(value);
      }
    } catch (error) {
      console.error('Failed to change volume', error);
    }
  };
  
  // Stop playback
  const stopPlayback = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setIsPlaying(false);
        setPlaybackPosition(0);
        
        // Reset audio mode to not stay active in background
        await configureAudioSession(false);
        
        // Clear timer if it exists
        if (playbackTimer) {
          clearInterval(playbackTimer);
          setPlaybackTimer(null);
        }
      }
    } catch (error) {
      console.error('Failed to stop playback', error);
    }
  };
  
  // Load audio when audioUri changes
  useEffect(() => {
    if (audioUri) {
      loadSound(audioUri);
    }
    
    // Set up keyboard shortcuts for playback control
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Disable keyboard shortcuts when keyboard is visible
      if (sound) {
        sound.setIsEnabledToPlayInSilentMode(false);
      }
    });
    
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Re-enable audio playback when keyboard hides
      if (sound) {
        sound.setIsEnabledToPlayInSilentMode(true);
      }
    });
    
    return () => {
      // Cleanup function
      if (sound) {
        sound.unloadAsync();
      }
      
      // Remove keyboard listeners
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [audioUri]);
  
  // Dynamic shadow based on state
  const dynamicButtonShadow = {
    ...Platform.select({
      ios: {
        shadowOpacity: buttonShadowOpacity,
        shadowRadius: buttonShadowRadius,
        shadowColor: isRecording ? '#f44336' : '#1a73e8',
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: buttonElevation,
        shadowColor: isRecording ? '#f44336' : '#1a73e8',
      },
    })
  };

  return (
    <View style={styles.container}>
      {isRecording ? (
        <Animated.View 
          style={[
            styles.recordingContainer,
            {
              opacity: recordingEntryAnim,
              transform: [
                { 
                  translateY: recordingEntryAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  }) 
                }
              ]
            }
          ]}
        >
          <Animatable.View 
            animation="fadeInDown" 
            duration={400}
            useNativeDriver
            style={styles.timerContainer}
          >
            <Animated.View 
              style={[
                styles.recordingIndicator,
                { 
                  opacity: pulseAnim,
                  transform: [{ scale: pulseAnim }] 
                }
              ]} 
            />
            <Text style={styles.timerText}>{formatTime(recordingDuration)}</Text>
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeIn" 
            duration={600}
            useNativeDriver
            style={styles.waveformContainer}
          >
            {[...Array(7)].map((_, index) => (
              <Animated.View 
                key={index}
                style={[
                  styles.waveBar,
                  {
                    height: 10 + Math.random() * 30,
                    opacity: waveAnim,
                    transform: [
                      { 
                        scaleY: waveAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.3, 1 + Math.random() * 0.5, 0.3]
                        }) 
                      }
                    ]
                  }
                ]}
              />
            ))}
          </Animatable.View>
          
          <Animated.View
            style={[
              {
                transform: [{ scale: buttonScaleAnim }],
                ...dynamicButtonShadow
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.stopButton}
              onPress={stopRecording}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              activeOpacity={0.9}
            >
              <View>
                <MaterialIcons name="stop" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      ) : audioUri ? (
        // Audio playback UI
        <Animatable.View
          animation="fadeIn"
          duration={500}
          useNativeDriver
          style={styles.playbackContainer}
        >
          <View style={styles.playbackInfo}>
            <Animatable.Text 
              style={styles.playbackTitle}
              animation="fadeIn"
              duration={300}
              useNativeDriver
            >
              Voice Note
            </Animatable.Text>
            <Animatable.View
              animation="fadeIn"
              duration={400}
              useNativeDriver
              style={styles.timerContainer}
            >              
              <Text style={styles.timerText}>
                {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
              </Text>
            </Animatable.View>
            <Animatable.View 
              animation="fadeIn" 
              duration={600}
              useNativeDriver
              style={styles.playbackWaveformContainer}
            >
              {[...Array(7)].map((_, index) => (
                <Animated.View 
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      height: 10 + Math.random() * 20,
                      opacity: waveAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.4, 1, 0.4]
                      }),
                      transform: [
                        { 
                          scaleY: isPlaying ? 
                            waveAnim.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0.3, 0.5 + Math.random() * 0.5, 0.3]
                            }) : 
                            0.3
                        }
                      ],
                      backgroundColor: isPlaying ? '#1a73e8' : '#999'
                    }
                  ]}
                />
              ))}
            </Animatable.View>
            <Animated.View
              style={[
                styles.sliderContainer,
                {
                  transform: [{ scale: sliderAnim }]
                }
              ]}
            >
              <Slider
                value={playbackPosition}
                minimumValue={0}
                maximumValue={playbackDuration}
                onValueChange={(value) => {
                  // Update UI immediately for responsive feel
                  setPlaybackPosition(value);
                }}
                onSlidingComplete={seekToPosition}
                minimumTrackTintColor="#1a73e8"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#1a73e8"
                style={styles.slider}
              />
            </Animated.View>
            <View style={styles.playbackControls}>
              {/* Main playback controls row */}
              <View style={styles.primaryControlsRow}>
                <Animated.View
                  style={[
                    {
                      transform: [{ scale: buttonScaleAnim }],
                      ...dynamicButtonShadow
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={playRecording}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    activeOpacity={0.9}
                  >
                    <MaterialIcons 
                      name={isPlaying ? "pause" : "play_arrow"} 
                      size={32} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                </Animated.View>
                {isPlaying && (
                  <Animated.View
                    style={[
                      {
                        transform: [{ scale: buttonScaleAnim }],
                        ...dynamicButtonShadow
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.stopPlaybackButton}
                      onPress={stopPlayback}
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      activeOpacity={0.9}
                    >
                      <MaterialIcons name="stop" size={24} color="#fff" />
                    </TouchableOpacity>
                  </Animated.View>
                )}
                <Animated.View
                  style={[
                    {
                      transform: [{ scale: buttonScaleAnim }],
                      ...dynamicButtonShadow
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.recordAgainButton}
                    onPress={() => {
                      stopPlayback();
                      setTimeout(() => {
                        if (sound) {
                          sound.unloadAsync();
                          setSound(null);
                        }
                        // Clear audioUri to get back to recording UI state
                        if (onRecordingComplete) {
                          onRecordingComplete(null);
                        }
                        // Start recording immediately 
                        startRecording();
                      }, 300);
                    }}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    activeOpacity={0.9}
                  >
                    <MaterialIcons name="mic" size={24} color="#fff" />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Secondary controls row (playback settings) */}
              <View style={styles.secondaryControlsRow}>
                <TouchableOpacity
                  style={styles.speedButton}
                  onPress={() => {
                    // Cycle through playback speeds: 0.5 -> 1.0 -> 1.5 -> 2.0 -> 0.5
                    const nextRate = playbackRate === 0.5 ? 1.0 : 
                                    playbackRate === 1.0 ? 1.5 : 
                                    playbackRate === 1.5 ? 2.0 : 0.5;
                    changePlaybackRate(nextRate);
                    
                    // Add visual feedback with animation
                    Animated.sequence([
                      Animated.timing(buttonScaleAnim, {
                        toValue: 0.9,
                        duration: 100,
                        useNativeDriver: true,
                      }),
                      Animated.timing(buttonScaleAnim, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                      }),
                    ]).start();
                  }}
                >
                  <Text style={styles.speedButtonText}>{playbackRate.toFixed(1)}x</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.volumeButton}
                  onPress={() => {
                    setShowVolumeControl(!showVolumeControl);
                    
                    // Add visual feedback
                    Animated.sequence([
                      Animated.timing(buttonScaleAnim, {
                        toValue: 0.9,
                        duration: 100,
                        useNativeDriver: true,
                      }),
                      Animated.timing(buttonScaleAnim, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                      }),
                    ]).start();
                  }}
                >
                  <MaterialIcons 
                    name={volume > 0.5 ? "volume-up" : volume > 0 ? "volume-down" : "volume-mute"} 
                    size={18} 
                    color="#1a73e8" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {showVolumeControl && (
              <Animatable.View 
                animation="fadeIn"
                duration={300}
                useNativeDriver
                style={styles.volumeControlContainer}
              >
                <Text style={styles.volumeLabel}>Volume</Text>
                <Slider
                  value={volume}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.05}
                  onValueChange={(value) => changeVolume(value)}
                  minimumTrackTintColor="#1a73e8"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1a73e8"
                  style={styles.volumeSlider}
                />
              </Animatable.View>
            )}
          </View>
        </Animatable.View>
      ) : (
        // Recording button UI
        <Animatable.View 
          animation="fadeIn" 
          duration={500}
          useNativeDriver
        >
          <Animated.View
            style={[
              {
                transform: [{ scale: buttonScaleAnim }],
                ...dynamicButtonShadow
              }
            ]}
          >
            <TouchableOpacity
              style={styles.recordButton}
              onPress={startRecording}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              activeOpacity={0.9}
            >
              <Animatable.View animation="pulse" iterationCount={3} duration={1500} useNativeDriver>
                <MaterialIcons name="mic" size={32} color="#fff" />
              </Animatable.View>
            </TouchableOpacity>
          </Animated.View>
          <Animatable.Text 
            style={styles.recordHint}
            animation="fadeIn"
            delay={300}
            duration={500}
            useNativeDriver
          >
            Tap to start recording
          </Animatable.Text>
        </Animatable.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1a73e8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
        shadowColor: '#1a73e8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
    }),
  },
  // Playback UI Styles
  playbackContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(250, 250, 250, 0.9)',
    paddingBottom: 18,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.07)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  playbackInfo: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  playbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: 10,
    letterSpacing: 0.5,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sliderContainer: {
    width: '100%',
    marginVertical: 10,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#1a73e8',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  slider: {
    width: '100%',
    height: 40,
  },
  playbackControls: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  primaryControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
  secondaryControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1a73e8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
        shadowColor: '#1a73e8',
      },
    }),
  },
  stopPlaybackButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f44336',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#f44336',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
        shadowColor: '#f44336',
      },
    }),
  },
  recordAgainButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4caf50',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
        shadowColor: '#4caf50',
      },
    }),
  },
  recordingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#1a73e8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f44336',
    marginRight: 10,
  },
  timerText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    letterSpacing: 1,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 50,
    width: '80%',
    marginBottom: 20,
  },
  playbackWaveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 30,
    width: '80%',
    marginVertical: 5,
  },
  waveBar: {
    width: 6,
    backgroundColor: '#1a73e8',
    marginHorizontal: 4,
    borderRadius: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#1a73e8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f44336',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#f44336',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
        shadowColor: '#f44336',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
    }),
  },
  speedButton: {
    marginHorizontal: 8,
    backgroundColor: 'rgba(26, 115, 232, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(26, 115, 232, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#1a73e8',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  speedButtonText: {
    fontSize: 13,
    color: '#1a73e8',
    fontWeight: '600',
  },
  volumeButton: {
    marginHorizontal: 8,
    backgroundColor: 'rgba(26, 115, 232, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(26, 115, 232, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#1a73e8',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  volumeControlContainer: {
    width: '92%',
    marginTop: 12,
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  volumeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  volumeSlider: {
    width: '100%',
    height: 30,
  },
  recordHint: {
    marginTop: 12,
    textAlign: 'center',
    color: '#777',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default VoiceRecorder;
