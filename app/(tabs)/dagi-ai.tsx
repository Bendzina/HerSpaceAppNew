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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { aiService } from '../../services/aiService';

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

  // 🌟 Tarot draw
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Dagi AI</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {language === 'ka' ? 'შენი პირადი მენტალური ასისტენტი' : 'Your personal mental assistant'}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions Bar */}
      <View style={[styles.actionsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsContent}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.background }]} onPress={drawTarot}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>{t.ai.tarot}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message: Message) => (
            <View key={message.id} style={[styles.messageContainer, message.isUser ? styles.userMessage : styles.aiMessage]}>
              <View style={[
                styles.messageBubble,
                message.isUser ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface },
              ]}>
                <Text style={[styles.messageText, { color: message.isUser ? '#FFF' : colors.text }]}>{message.text}</Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={[styles.messageBubble, { backgroundColor: colors.surface }]}>
                <Text style={[styles.typingText, { color: colors.textSecondary }]}>{t.ai.typing}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={language === 'ka' ? 'მითხარი რა გაწუხებს...' : 'Type your question...'}
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary, opacity: isTyping ? 0.5 : 1 }]}
              onPress={sendMessage}
              disabled={inputText.trim() === '' || isTyping}
            >
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 20 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  actionsBar: { paddingVertical: 12, borderBottomWidth: 1 },
  actionsContent: { paddingHorizontal: 16, gap: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  actionText: { fontSize: 14, marginLeft: 6, fontWeight: '500' },
  messagesContainer: { flex: 1, paddingHorizontal: 16 },
  messageContainer: { marginVertical: 4 },
  userMessage: { alignItems: 'flex-end' },
  aiMessage: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  messageText: { fontSize: 16, lineHeight: 22 },
  typingText: { fontSize: 14, fontStyle: 'italic' },
  inputContainer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', borderRadius: 25, paddingHorizontal: 16, paddingVertical: 8, minHeight: 50 },
  textInput: { flex: 1, fontSize: 16, lineHeight: 20, maxHeight: 100, marginRight: 8 },
  sendButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
