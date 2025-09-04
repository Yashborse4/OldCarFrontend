import React, { useRef, useEffect, useState } from 'react';
import { View, Image, Animated, Dimensions, Text, StyleSheet, TouchableOpacity, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useTheme } from '../theme';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.85;
const SPACING = 10;

const slideData = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Premium Sedans',
    description: 'Luxury driving experience at its finest',
    buttonText: 'Explore Now'
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'SUV Collection',
    description: 'Versatile vehicles for every adventure',
    buttonText: 'View Models'
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/70912/pexels-photo-70912.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Sports Cars',
    description: 'Experience the thrill of performance',
    buttonText: 'Discover'
  },
  {
    id: 4,
    image: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Electric Vehicles',
    description: 'The future of sustainable driving',
    buttonText: 'Learn More'
  }
];

const DummySlideshow = () => {
  const { isDark, colors } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slideData.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (CARD_WIDTH + SPACING),
        animated: true
      });
      setCurrentIndex(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Handle scroll to update index
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (CARD_WIDTH + SPACING));
        if (index !== currentIndex && index >= 0 && index < slideData.length) {
          setCurrentIndex(index);
        }
      } 
    }
  );

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + SPACING}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slideData.map((item, index) => (
          <View 
            key={item.id} 
            style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.cardImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
              <TouchableOpacity style={styles.cardButton}>
                <Text style={styles.cardButtonText}>{item.buttonText}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ))}
      </Animated.ScrollView>
      
      {/* Pagination indicators */}
      <View style={styles.pagination}>
        {slideData.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.paginationDot, 
              index === currentIndex && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 260,
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: width * 0.075, // Adjust for card width
    paddingVertical: 10,
  },
  card: {
    width: CARD_WIDTH,
    height: 200,
    marginRight: SPACING,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  cardButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  cardButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 13,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FFD700',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default DummySlideshow;

