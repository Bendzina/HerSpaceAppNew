import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Animated,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '../../ThemeContext';
import { useLanguage } from '../../LanguageContext';
import dagiAIService from '../../../services/dagiAIService';
import { Colors } from '@/constants/Colors';

interface TarotAPICard {
  card_id: number;
  name: string;
  suit: string;
  is_major_arcana: boolean;
  is_reversed: boolean;
  position: number;
  meanings: string[];
}

// Define extended color type to include all required colors
type ExtendedColors = {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  card: string;
  surface: string;
  border: string;
  textSecondary: string;
  primary: string;
};

export default function TarotScreen() {
  const { colors: themeColors } = useTheme();
  const { language, t } = useLanguage();

  const [tarotQuestion, setTarotQuestion] = useState('');
  const [selectedCardCount, setSelectedCardCount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string>('');
  const [cards, setCards] = useState<TarotAPICard[] | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();
  
  // Extend the base colors with additional properties
  const baseColors = Colors[colorScheme || 'light'];
  const colors = {
    ...baseColors,
    card: baseColors.background,
    surface: baseColors.background,
    border: baseColors.tabIconDefault,
    textSecondary: baseColors.tabIconDefault,
    primary: colorScheme === 'dark' ? '#BB86FC' : '#6200EE',
  };
  
  // Animation values
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const [cardAnims, setCardAnims] = useState<Animated.Value[]>([]);
  
  // Initialize card animations when cards change
  useEffect(() => {
    if (cards && cards.length > 0) {
      const newAnims = cards.map(() => new Animated.Value(0));
      setCardAnims(newAnims);
      animateCards(newAnims);
    }
  }, [cards]);

  const cardCountOptions = [
    { value: 1, label: language === 'ka' ? '1 კარტი' : '1 Card', icon: 'book' },
    { value: 3, label: language === 'ka' ? '3 კარტი' : '3 Cards', icon: 'albums' },
    { value: 5, label: language === 'ka' ? '5 კარტი' : '5 Cards', icon: 'layers' },
    { value: 10, label: language === 'ka' ? 'კელტური ჯვარი' : 'Celtic Cross', icon: 'grid' },
  ];

  const getTarotReading = async (question: string, readingType: string) => {
    try {
      // Use a more structured prompt that specifies spread positions for better AI interpretation
      const spreadStructure = selectedCardCount === 1 
        ? 'single card' 
        : selectedCardCount === 3 
        ? 'three card spread (past, present, future)' 
        : selectedCardCount === 5 
        ? 'five card spread (past, present, challenge, outcome, advice)' 
        : `Celtic Cross spread with ${selectedCardCount} cards`;
      
      const prompt = `Provide a tarot reading using ${spreadStructure} for the question: "${question}". Include interpretation for each card position and overall guidance.`;
      const response = await dagiAIService.sendMessage(prompt);
      return response;
    } catch (error) {
      console.error('Error getting tarot reading:', error);
      throw error;
    }
  };

  const formatTarotReading = (reading: any): string => {
    if (language === 'ka') {
      const cardLabel = selectedCardCount === 1 ? 'ერთი კარტი' : selectedCardCount === 3 ? 'სამი კარტი' : selectedCardCount === 5 ? 'ხუთი კარტი' : `${selectedCardCount} კარტი`;
      return `🔮 ტაროს გაშლა: ${cardLabel}\n\n${reading.interpretation}\n\n💡 რჩევა: ${reading.advice}\n\n${reading.temporary_note ? `📝 ${reading.temporary_note}` : ''}`;
    } else {
      const cardLabel = selectedCardCount === 1 ? 'Single Card' : selectedCardCount === 3 ? 'Three Card' : selectedCardCount === 5 ? 'Five Card' : `${selectedCardCount} Cards`;
      return `🔮 Tarot Reading: ${cardLabel}\n\n${reading.interpretation}\n\n💡 Advice: ${reading.advice}\n\n${reading.temporary_note ? `📝 ${reading.temporary_note}` : ''}`;
    }
  };

  const startShimmer = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateCards = (anims: Animated.Value[]) => {
    const animations = anims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      })
    );
    
    Animated.stagger(100, animations).start();
  };

  const drawTarot = async () => {
    const question = tarotQuestion.trim();
    setLoading(true);
    setResultText('');
    setCards(null);
    startShimmer();

    let readingType = 'single_card';
    if (selectedCardCount === 3) readingType = 'three_card';
    else if (selectedCardCount === 10) readingType = 'celtic_cross';
    else if (selectedCardCount === 5) readingType = 'five_card';
    else if (selectedCardCount === 10) readingType = 'celtic_cross';

    try {
      const response = await getTarotReading(question, readingType);
      const reading = response?.reading;
      if (reading) {
        setResultText(formatTarotReading(reading));
        if (reading.cards_drawn) {
          setCards(reading.cards_drawn);
        }
      } else if (response?.message) {
        setResultText(response.message);
      } else {
        setResultText(
          language === 'ka' 
            ? 'ვერ მოხერხდა გაშლა.' 
            : 'Could not get a reading.'
        );
      }
    } catch (e) {
      console.error('Tarot reading error:', e);
      setResultText(
        language === 'ka' 
          ? 'შეცდომა. სცადე თავიდან.' 
          : 'Error. Please try again.'
      );
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Enhanced Header with Mystical Gradient */}
        <LinearGradient
          colors={['#4A148C', '#7B1FA2', '#9C27B0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Ionicons name="sparkles" size={20} color="#FFD700" style={{ marginRight: 8 }} />
              <Text style={styles.headerTitle}>{t.ai?.tarot ?? 'Tarot Reading'}</Text>
              <Ionicons name="sparkles" size={20} color="#FFD700" style={{ marginLeft: 8 }} />
            </View>
            <View style={{ width: 24 }} />
          </View>
        </LinearGradient>

        <ScrollView 
          ref={scrollRef} 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Card */}
          <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#9C27B0" />
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                {language === 'ka' ? 'თქვენი კითხვა' : 'Your Question'}
              </Text>
            </View>
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              {language === 'ka' 
                ? 'ჩაისუნთქეთ ცხვირით, ამოისუნთქეთ პირით, 3-ჯერ და დაფიქრდით თქვენს კითხვაზე სუფთა გულით' 
                : 'Inhale through your nose and exhale through your mouth 3 times and think about your question with a pure heart.'}
            </Text>
            <TextInput
              style={[styles.input, { 
                color: colors.text, 
                backgroundColor: colors.background, 
                borderColor: colors.tabIconDefault 
              }]}
              value={tarotQuestion}
              onChangeText={setTarotQuestion}
              placeholder={language === 'ka' ? 'დასვი შენი შეკითხვა ვარსკვლავებს...' : 'Ask the stars your question...'}
              placeholderTextColor={colors.tabIconDefault}
              multiline
            />
          </View>

          {/* Card Count Selection */}
          <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="albums" size={20} color="#7B1FA2" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {language === 'ka' ? 'აირჩიეთ გაშლა' : 'Choose Spread'}
              </Text>
            </View>
            <View style={styles.countGrid}>
              {cardCountOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.countButton,
                    selectedCardCount === option.value && styles.countButtonSelected,
                    { borderColor: colors.primary },
                    selectedCardCount === option.value && { 
                      backgroundColor: colors.primary,
                      borderColor: colors.primary 
                    },
                  ]}
                  onPress={() => setSelectedCardCount(option.value)}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={selectedCardCount === option.value ? '#fff' : colors.primary} 
                  />
                  <Text style={[
                    styles.countButtonText,
                    { 
                      color: selectedCardCount === option.value ? '#fff' : colors.text,
                    },
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Draw Button */}
          <TouchableOpacity
            disabled={loading}
            onPress={drawTarot}
            activeOpacity={0.8}
            style={[styles.drawBtnContainer, { opacity: loading ? 0.6 : 1 }]}
          >
            <LinearGradient
              colors={['#9C27B0', '#7B1FA2', '#6A1B9A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.drawBtn}
            >
              {loading && (
                <Animated.View
                  style={[
                    styles.shimmer,
                    {
                      transform: [{ translateX: shimmerTranslate }],
                    },
                  ]}
                />
              )}
              <Ionicons 
                name={loading ? 'hourglass' : 'sparkles'} 
                size={22} 
                color="#FFF" 
              />
              <Text style={styles.drawText}>
                {loading 
                  ? (language === 'ka' ? 'კარტები იშლება...' : 'Reading the cards...') 
                  : (language === 'ka' ? '🔮 გაშლა' : '🔮 Draw Cards')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Result */}
          {!!resultText && (
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: '#9C27B0' }]}>
              <View style={styles.resultHeader}>
                <Ionicons name="planet" size={24} color="#9C27B0" />
                <Text style={[styles.resultTitle, { color: colors.text }]}>
                  {language === 'ka' ? 'თქვენი გაშლა' : 'Your Reading'}
                </Text>
              </View>
              <Text style={[styles.resultText, { color: colors.text }]}>{resultText}</Text>
            </View>
          )}

          {/* Cards Display */}
          {cards?.length ? (
            <View style={styles.cardsContainer}>
              {cards.map((card, idx) => {
                const cardAnim = cardAnims[idx] || new Animated.Value(1);
                const scale = cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                });
                const opacity = cardAnim;

                return (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.tarotCard,
                      { 
                        backgroundColor: colors.surface, 
                        borderColor: card.is_major_arcana ? '#FFD700' : colors.border,
                        transform: [{ scale }],
                        opacity,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={card.is_major_arcana 
                        ? ['#FFD700', '#FFA000', '#FF6F00'] 
                        : ['#9C27B0', '#7B1FA2']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.cardGradient}
                    >
                      {card.is_reversed && (
                        <View style={styles.reversedBadge}>
                          <Ionicons name="repeat" size={14} color="#FFF" />
                          <Text style={styles.reversedText}>
                            {language === 'ka' ? 'შებრუნებული' : 'Reversed'}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.cardName}>{card.name}</Text>
                      <Text style={styles.cardSuit}>{card.suit}</Text>
                      {card.is_major_arcana && (
                        <View style={styles.majorBadge}>
                          <Ionicons name="star" size={12} color="#FFD700" />
                          <Text style={styles.majorText}>Major Arcana</Text>
                        </View>
                      )}
                    </LinearGradient>
                    {!!card.meanings?.length && (
                      <View style={styles.cardMeaningContainer}>
                        <Text style={[styles.cardMeaning, { color: colors.text }]}>
                          {card.meanings[0]}
                        </Text>
                      </View>
                    )}
                  </Animated.View>
                );
              })}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: { 
      flex: 1 
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 50 : 20,
      paddingBottom: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    headerOverlay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    backBtn: { 
      padding: 8,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerCenter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: { 
      fontSize: 20, 
      fontWeight: '700', 
      color: '#FFF',
      letterSpacing: 0.5,
    },
    content: { flex: 1 },
    contentContainer: { 
      padding: 16,
      paddingBottom: 32,
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 8,
    },
    instructionText: {
      fontSize: 14,
      fontStyle: 'italic',
      marginBottom: 12,
      textAlign: 'center',
    },
    input: {
      minHeight: 100,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      textAlignVertical: 'top',
    },
    countGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    countButton: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 12,
      backgroundColor: 'transparent',
    },
    countButtonSelected: {
      shadowColor: '#6200EE',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    countButtonText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '600',
    },
    drawBtnContainer: {
      marginBottom: 16,
    },
    drawBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      paddingVertical: 16,
      shadowColor: '#9C27B0',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      overflow: 'hidden',
    },
    shimmer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.3)',
      width: '30%',
    },
    drawText: { 
      marginLeft: 10, 
      color: '#FFF', 
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.5,
    },
    resultCard: {
      borderRadius: 16,
      borderWidth: 2,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#9C27B0',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(156, 39, 176, 0.2)',
    },
    resultTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginLeft: 10,
    },
    resultText: { 
      fontSize: 15, 
      lineHeight: 24,
      letterSpacing: 0.3,
    },
    cardsContainer: {
      gap: 12,
    },
    tarotCard: {
      borderRadius: 16,
      borderWidth: 2,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    cardGradient: {
      padding: 16,
      minHeight: 120,
      justifyContent: 'center',
    },
    reversedBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    reversedText: {
      color: '#FFF',
      fontSize: 11,
      fontWeight: '600',
      marginLeft: 4,
    },
    cardName: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFF',
      marginBottom: 6,
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    cardSuit: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '500',
    },
    majorBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      backgroundColor: 'rgba(255,215,0,0.2)',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    majorText: {
      color: '#FFD700',
      fontSize: 11,
      fontWeight: '700',
      marginLeft: 4,
    },
    cardMeaningContainer: {
      padding: 14,
      backgroundColor: 'rgba(156, 39, 176, 0.05)',
    },
    cardMeaning: {
      fontSize: 14,
      lineHeight: 20,
      fontStyle: 'italic',
    },
  });