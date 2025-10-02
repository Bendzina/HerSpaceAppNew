import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import dagiAIService from '../../services/dagiAIService';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTarotReading?: boolean;
  tarotData?: any;
}

interface TarotCard {
  id: number;
  name: string;
  description: string;
  suit: string;
  is_major_arcana: boolean;
  is_reversed: boolean;
  meanings: string[];
}

export default function DagiAIScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t.ai.welcome,
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [selectedCardCount, setSelectedCardCount] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const cardCountOptions = [
    { value: 1, label: language === 'ka' ? '1 კარტი' : '1 Card' },
    { value: 3, label: language === 'ka' ? '3 კარტი' : '3 Cards' },
    { value: 5, label: language === 'ka' ? '5 კარტი' : '5 Cards' },
    { value: 10, label: language === 'ka' ? 'კელტური ჯვარი (10)' : 'Celtic Cross (10)' },
  ];

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsTyping(true);

    try {
      const response = await dagiAIService.sendMessage(currentInput);

      let aiResponseText = response.message;
      let isTarotReading = false;
      let tarotData = null;

      // If this was a tarot reading, format the response nicely
      if (response.reading) {
        isTarotReading = true;
        tarotData = response.reading;
        aiResponseText = formatTarotReading(response.reading);
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
        isTarotReading,
        tarotData,
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: language === 'ka'
          ? 'უკაცრავად, ახლა ვერ ვუპასუხებ 🙏'
          : 'Sorry, I cannot respond right now 🙏',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const formatTarotReading = (reading: any): string => {
    if (language === 'ka') {
      return `🔮 ტაროს გაშლა: ${reading.prompt_type === 'single_card' ? 'ერთი კარტი' : reading.prompt_type === 'three_card' ? 'სამი კარტი' : 'კარტები'}

${reading.interpretation}

💡 რჩევა: ${reading.advice}

${reading.temporary_note ? `\n📝 ${reading.temporary_note}` : ''}`;
    } else {
      return `🔮 Tarot Reading: ${reading.prompt_type === 'single_card' ? 'Single Card' : reading.prompt_type === 'three_card' ? 'Three Card' : 'Cards'}

${reading.interpretation}

💡 Advice: ${reading.advice}

${reading.temporary_note ? `\n📝 ${reading.temporary_note}` : ''}`;
    }
  };

  const renderTarotCards = (cards: TarotCard[]) => {
    return cards.map((card, index) => (
      <View key={index} style={[styles.tarotCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardName, { color: colors.text }]}>
          {card.is_reversed ? '🔄 ' : ''}{card.name}
        </Text>
        <Text style={[styles.cardSuit, { color: colors.textSecondary }]}>
          {card.suit} {card.is_major_arcana ? '(Major Arcana)' : ''}
        </Text>
        {card.meanings && card.meanings.length > 0 && (
          <Text style={[styles.cardMeaning, { color: colors.textSecondary }]}>
            • {card.meanings[0]}
          </Text>
        )}
      </View>
    ));
  };

  const [tarotQuestion, setTarotQuestion] = useState('');
  const [showQuestionInput, setShowQuestionInput] = useState(false);

  const drawTarot = async (count: number = selectedCardCount) => {
    setShowCardSelector(false);
    
    // If we don't have a question yet, show the input
    if (!tarotQuestion) {
      setShowQuestionInput(true);
      return;
    }
    
    setIsTyping(true);

    let readingType = 'single_card';
    if (count === 3) readingType = 'three_card';
    else if (count === 10) readingType = 'celtic_cross';
    else if (count === 5) readingType = 'five_card';

    const tarotPrompt = language === 'ka'
      ? `მომხმარებელმა დაისვა შემდეგი კითხვა: "${tarotQuestion}". გააკეთე ${count} ტაროს კარტის გაშლა და განმარტება ქართულად, თბილად და მხარდამჭერი ტონით.`
      : `The user asked: "${tarotQuestion}". Draw ${count} tarot cards and give a warm, supportive interpretation in English.`;

    try {
      const response = await dagiAIService.sendMessage(tarotPrompt);

      let aiResponseText = response.message;
      let isTarotReading = false;
      let tarotData = null;

      if (response.reading) {
        isTarotReading = true;
        tarotData = response.reading;
        aiResponseText = formatTarotReading(response.reading);
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
        isTarotReading,
        tarotData,
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error drawing tarot:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: language === 'ka'
          ? 'უკაცრავად, ტაროს გაშლა ვერ მოხერხდა 🙏'
          : 'Sorry, could not perform tarot reading 🙏',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleCardCountSelect = (count: number) => {
    setSelectedCardCount(count);
    drawTarot(count);
  };

  const renderCardSelector = () => (
    <Modal
      transparent={true}
      visible={showCardSelector}
      animationType="fade"
      onRequestClose={() => setShowCardSelector(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowCardSelector(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {language === 'ka' ? 'აირჩიეთ კარტების რაოდენობა' : 'Select number of cards'}
            </Text>
            {cardCountOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.cardOption,
                  {
                    backgroundColor: selectedCardCount === option.value 
                      ? colors.primary 
                      : colors.surface,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => handleCardCountSelect(option.value)}
              >
                <Text 
                  style={[
                    styles.cardOptionText, 
                    { 
                      color: selectedCardCount === option.value 
                        ? colors.background 
                        : colors.text 
                    }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => setShowCardSelector(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                {language === 'ka' ? 'გაუქმება' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Handle question submission
  const handleQuestionSubmit = () => {
    if (tarotQuestion.trim()) {
      setShowQuestionInput(false);
      drawTarot();
    }
  };

  const renderQuestionModal = () => (
    <Modal
      transparent={true}
      visible={showQuestionInput}
      animationType="slide"
      onRequestClose={() => setShowQuestionInput(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowQuestionInput(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {language === 'ka' ? 'რა გაინტერესებს?' : 'What is your question?'}
            </Text>
            <TextInput
              style={[
                styles.textInput, 
                { 
                  color: colors.text, 
                  backgroundColor: colors.surface,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  marginBottom: 20,
                  padding: 15,
                }
              ]}
              value={tarotQuestion}
              onChangeText={setTarotQuestion}
              placeholder={
                language === 'ka' 
                  ? 'დასვი შენი შეკითხვა ტაროს...' 
                  : 'Ask your question to the tarot...'
              }
              placeholderTextColor={colors.textSecondary}
              multiline
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => setShowQuestionInput(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  {language === 'ka' ? 'გაუქმება' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: colors.primary,
                    opacity: tarotQuestion.trim() ? 1 : 0.5
                  }
                ]}
                onPress={handleQuestionSubmit}
                disabled={!tarotQuestion.trim()}
              >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>
                  {language === 'ka' ? 'გაგრძელება' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderCardSelector()}
        {renderQuestionModal()}
        {/* Header with gradient background */}
      <LinearGradient
        colors={['#E8F4FD', '#F0E8FF', '#FFE5F1']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#667EEA', '#764BA2', '#F093FB']}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>🤖</Text>
            </LinearGradient>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Dagi AI</Text>
            <Text style={styles.headerSubtitle}>
              💫 {language === 'ka' ? 'შენი პირადი მენტალური ასისტენტი' : 'Your personal mental assistant'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Actions Bar */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/dagi-ai/tarot' as any)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B9D', '#C44569']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="sparkles" size={18} color="#FFF" />
            <Text style={styles.actionText}>{t.ai.tarot}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message: Message, index) => (
            <View key={message.id} style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.aiMessage
            ]}>
              <View style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
              ]}>
                {message.isUser ? (
                  <LinearGradient
                    colors={['#FF6B9D', '#C44569']}
                    style={styles.userBubbleGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.userMessageText}>{message.text}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.aiBubbleContent, { backgroundColor: colors.card }]}>
                    <View style={styles.aiMessageHeader}>
                      <View style={styles.aiAvatar}>
                        <Text style={styles.aiAvatarEmoji}>🤖</Text>
                      </View>
                      <View style={styles.aiIndicator}>
                        <View style={[styles.aiDot, styles.aiDot1]} />
                        <View style={[styles.aiDot, styles.aiDot2]} />
                        <View style={[styles.aiDot, styles.aiDot3]} />
                      </View>
                    </View>
                    <Text style={[styles.aiMessageText, { color: colors.text }]}>{message.text}</Text>

                    {/* Display tarot cards if this message contains tarot data */}
                    {message.isTarotReading && message.tarotData?.cards_drawn && (
                      <View style={styles.tarotCardsContainer}>
                        {renderTarotCards(message.tarotData.cards_drawn)}
                      </View>
                    )}
                  </View>
                )}
              </View>
              <Text style={[styles.messageTime, { color: colors.textSecondary }]}>
                {message.timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </Text>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={[styles.aiBubbleContent, { backgroundColor: colors.card }]}>
                  <View style={styles.aiMessageHeader}>
                    <View style={styles.aiAvatar}>
                      <Text style={styles.aiAvatarEmoji}>🤖</Text>
                    </View>
                    <View style={styles.typingIndicator}>
                      <View style={[styles.typingDot, styles.typingDot1]} />
                      <View style={[styles.typingDot, styles.typingDot2]} />
                      <View style={[styles.typingDot, styles.typingDot3]} />
                    </View>
                  </View>
                  <Text style={[styles.typingText, { color: colors.textSecondary }]}>{t.ai.typing}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
          <LinearGradient
            colors={['#F8F9FA', '#FFFFFF']}
            style={styles.inputGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={[styles.inputWrapper, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={inputText}
                onChangeText={setInputText}
                placeholder={language === 'ka' ? 'მითხარი რა გაწუხებს... 💭' : 'Type your question... 💭'}
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { opacity: (inputText.trim() === '' || isTyping) ? 0.5 : 1 }
                ]}
                onPress={sendMessage}
                disabled={inputText.trim() === '' || isTyping}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF6B9D', '#C44569']}
                  style={styles.sendButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="send" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Container and utility
  container: { flex: 1 },
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  contentContainer: { flexGrow: 1, padding: 16 },

  // Header
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  avatarContainer: {
    marginRight: 16,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28 },
  headerInfo: { alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#2D3748', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: '#718096', fontWeight: '500', textAlign: 'center' },

  // Actions bar
  actionsContainer: { paddingHorizontal: 24, paddingVertical: 20, alignItems: 'center' },
  actionButton: { borderRadius: 25, shadowColor: '#FF6B9D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  actionGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 25 },
  actionText: { fontSize: 16, marginLeft: 8, fontWeight: '600', color: '#FFF', letterSpacing: 0.5 },

  // Messages
  messagesContainer: { flex: 1 },
  messagesContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  messageContainer: { marginVertical: 8, maxWidth: width * 0.85 },
  userMessage: { alignItems: 'flex-end', alignSelf: 'flex-end' },
  aiMessage: { alignItems: 'flex-start', alignSelf: 'flex-start' },
  messageBubble: { borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  userBubble: {},
  aiBubble: {},
  userBubbleGradient: { paddingHorizontal: 20, paddingVertical: 16, borderRadius: 20, minHeight: 50, justifyContent: 'center' },
  userMessageText: { fontSize: 16, lineHeight: 22, color: '#FFF', fontWeight: '500' },
  aiBubbleContent: { paddingHorizontal: 16, paddingVertical: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 107, 157, 0.1)' },
  aiMessageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFE5F1', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  aiAvatarEmoji: { fontSize: 14 },
  aiIndicator: { flexDirection: 'row', alignItems: 'center' },
  aiDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF6B9D', marginHorizontal: 1 },
  aiDot1: {},
  aiDot2: { opacity: 0.7 },
  aiDot3: { opacity: 0.4 },
  aiMessageText: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  messageTime: { fontSize: 12, marginTop: 4, marginHorizontal: 8, fontWeight: '500' },

  // Typing indicator
  typingIndicator: { flexDirection: 'row', alignItems: 'center' },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B9D', marginHorizontal: 2 },
  typingDot1: {},
  typingDot2: { opacity: 0.7 },
  typingDot3: { opacity: 0.4 },
  typingText: { fontSize: 14, fontStyle: 'italic', fontWeight: '500' },

  // Tarot
  tarotCardsContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 107, 157, 0.1)' },
  tarotCard: { padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255, 107, 157, 0.2)' },
  cardName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardSuit: { fontSize: 14, marginBottom: 4 },
  cardMeaning: { fontSize: 12, fontStyle: 'italic' },
  tarotCardReversed: { transform: [{ rotate: '180deg' }] },
  tarotCardText: { fontSize: 12, textAlign: 'center', padding: 4 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  modalButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginLeft: 8, borderWidth: 1 },
  modalButtonText: { fontSize: 14, fontWeight: '500' },
  cardOption: { padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, alignItems: 'center' },
  cardOptionText: { fontSize: 16, fontWeight: '500' },
  cancelButton: { marginTop: 16, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '500' },

  // Input
  inputContainer: { paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  inputGradient: { paddingHorizontal: 20, paddingVertical: 16, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, minHeight: 54, borderWidth: 1, borderColor: 'rgba(255, 107, 157, 0.2)', shadowColor: '#FF6B9D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  textInput: { flex: 1, fontSize: 16, lineHeight: 20, maxHeight: 100, marginRight: 12, fontWeight: '400' },
  sendButton: { borderRadius: 20, shadowColor: '#FF6B9D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  sendButtonGradient: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  // Additional
  botMessage: { alignSelf: 'flex-start', backgroundColor: '#f5f5f5', borderTopRightRadius: 16, borderBottomRightRadius: 16, borderBottomLeftRadius: 8, padding: 12, marginRight: 40 },
  loadingContainer: { padding: 8, alignItems: 'center' },
  loadingText: { marginTop: 4, fontSize: 12, color: '#757575' },
  cardSelectorContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  cardCountButton: { padding: 8, borderRadius: 16, minWidth: 40, alignItems: 'center', marginHorizontal: 4 },
  cardCountText: { fontSize: 14, fontWeight: '500' },
});