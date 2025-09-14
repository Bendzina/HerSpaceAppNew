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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { aiService } from '../../services/aiService';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
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
  const scrollViewRef = useRef<ScrollView>(null);

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
      const aiResponseText = await aiService.sendMessage(
        [{ role: 'user', content: currentInput }],
        language
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch {
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

  const drawTarot = async () => {
    setIsTyping(true);

    const tarotPrompt = language === 'ka'
      ? "გააკეთე ერთი ტაროს კარტის გაშლა და განმარტება ქართულად, თბილად და მხარდამჭერი ტონით."
      : "Draw one tarot card and give a warm, supportive interpretation in English.";

    try {
      const aiResponseText = await aiService.sendMessage(
        [{ role: 'user', content: tarotPrompt }],
        language
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: language === 'ka'
          ? 'ტაროს კარტის გაშლა ვერ მოხერხდა 🙏'
          : 'Tarot draw failed 🙏',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          onPress={drawTarot}
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
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  flex: { 
    flex: 1 
  },
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
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarContainer: {
    marginRight: 16,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  avatarText: { 
    fontSize: 28 
  },
  headerInfo: { 
    alignItems: 'center'
  },
  headerTitle: { 
    fontSize: 32,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4
  },
  headerSubtitle: { 
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
    textAlign: 'center'
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 25,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionGradient: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    borderRadius: 25,
  },
  actionText: { 
    fontSize: 16, 
    marginLeft: 8, 
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.5
  },
  messagesContainer: { 
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  messageContainer: { 
    marginVertical: 8,
    maxWidth: width * 0.85,
  },
  userMessage: { 
    alignItems: 'flex-end',
    alignSelf: 'flex-end'
  },
  aiMessage: { 
    alignItems: 'flex-start',
    alignSelf: 'flex-start'
  },
  messageBubble: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userBubble: {},
  aiBubble: {},
  userBubbleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    minHeight: 50,
    justifyContent: 'center',
  },
  userMessageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#FFF',
    fontWeight: '500'
  },
  aiBubbleContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  aiMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE5F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiAvatarEmoji: {
    fontSize: 14,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF6B9D',
    marginHorizontal: 1,
  },
  aiDot1: {},
  aiDot2: { opacity: 0.7 },
  aiDot3: { opacity: 0.4 },
  aiMessageText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400'
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 8,
    fontWeight: '500',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B9D',
    marginHorizontal: 2,
  },
  typingDot1: {
    // Animation would be added here in a real implementation
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 0.4,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '500'
  },
  inputContainer: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  inputGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 54,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.2)',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    marginRight: 12,
    fontWeight: '400'
  },
  sendButton: {
    borderRadius: 20,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});