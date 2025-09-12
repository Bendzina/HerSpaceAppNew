import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

const { width } = Dimensions.get('window');

interface MindfulActivity {
  id: string;
  title: string;
  duration: string;
  description: string;
  icon: string;
  color: string;
}

export default function MindfulScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const activities: MindfulActivity[] = [
    {
      id: '1',
      title: language === 'ka' ? 'სუნთქვის ვარჯიში' : 'Breathing Exercise',
      duration: '5 min',
      description: language === 'ka' 
        ? 'მშვიდი სუნთქვით დაისვენე და დაემშვიდობე' 
        : 'Relax and calm down with peaceful breathing',
      icon: 'leaf-outline',
      color: '#4CAF50'
    },
    {
      id: '2', 
      title: language === 'ka' ? 'მედიტაცია' : 'Meditation',
      duration: '10 min',
      description: language === 'ka'
        ? 'მოძებნე შინაგანი სიმშვიდე და ჰარმონია'
        : 'Find inner peace and harmony',
      icon: 'flower-outline',
      color: '#9C27B0'
    },
    {
      id: '3',
      title: language === 'ka' ? 'ტანის რელაქსაცია' : 'Body Relaxation', 
      duration: '8 min',
      description: language === 'ka'
        ? 'გაათავისუფლე ტანის დაძაბულობა'
        : 'Release tension from your body',
      icon: 'body-outline',
      color: '#FF9800'
    },
    {
      id: '4',
      title: language === 'ka' ? 'ვიზუალიზაცია' : 'Visualization',
      duration: '12 min', 
      description: language === 'ka'
        ? 'წარმოიდგინე მშვიდი და ლამაზი ადგილები'
        : 'Imagine peaceful and beautiful places',
      icon: 'eye-outline',
      color: '#2196F3'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {language === 'ka' ? 'მაინდფულნესი' : 'Mindfulness'}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {language === 'ka' 
            ? 'დაისვენე და დაემშვიდობე ამ ვარჯიშებით' 
            : 'Relax and find peace with these exercises'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>7</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {language === 'ka' ? 'დღე ზედიზედ' : 'Day Streak'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>45</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {language === 'ka' ? 'წუთი დღეს' : 'Min Today'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {language === 'ka' ? 'შესრულებული' : 'Completed'}
            </Text>
          </View>
        </View>

        {/* Daily Goal */}
        <View style={[styles.goalContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.goalHeader}>
            <Text style={[styles.goalTitle, { color: colors.text }]}>
              {language === 'ka' ? 'დღეს მიზანი' : 'Today\'s Goal'}
            </Text>
            <Text style={[styles.goalProgress, { color: colors.primary }]}>3/5</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '60%' }]} />
          </View>
          <Text style={[styles.goalText, { color: colors.textSecondary }]}>
            {language === 'ka' ? '15 წუთი მედიტაცია' : '15 minutes meditation'}
          </Text>
        </View>

        {/* Activities */}
        <View style={styles.activitiesHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === 'ka' ? 'აღმოაჩინე ვარჯიშები' : 'Discover Exercises'}
          </Text>
        </View>

        {activities.map(activity => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.activityCard,
              { 
                backgroundColor: colors.surface,
                borderColor: selectedActivity === activity.id ? colors.primary : 'transparent'
              }
            ]}
            onPress={() => setSelectedActivity(activity.id)}
            activeOpacity={0.8}
          >
            <View style={styles.activityContent}>
              <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                <Ionicons name={activity.icon as any} size={28} color={activity.color} />
              </View>
              
              <View style={styles.activityInfo}>
                <View style={styles.activityHeader}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>
                    {activity.title}
                  </Text>
                  <Text style={[styles.activityDuration, { color: colors.primary }]}>
                    {activity.duration}
                  </Text>
                </View>
                <Text style={[styles.activityDescription, { color: colors.textSecondary }]}>
                  {activity.description}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: activity.color }]}
              onPress={() => {/* Start activity */}}
            >
              <Ionicons name="play" size={16} color="#FFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* Recent Sessions */}
        <View style={styles.recentHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === 'ka' ? 'ბოლო სესიები' : 'Recent Sessions'}
          </Text>
        </View>

        <View style={[styles.recentCard, { backgroundColor: colors.surface }]}>
          <View style={styles.recentItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={[styles.recentText, { color: colors.text }]}>
              {language === 'ka' ? 'სუნთქვის ვარჯიში • 5 წუთის წინ' : 'Breathing Exercise • 5 min ago'}
            </Text>
          </View>
          <View style={styles.recentItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={[styles.recentText, { color: colors.text }]}>
              {language === 'ka' ? 'მედიტაცია • გუშინ' : 'Meditation • Yesterday'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { fontSize: 16 },
  
  content: { flex: 1, paddingHorizontal: 20 },
  
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#E0E0E0', marginHorizontal: 15 },
  
  goalContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: { fontSize: 18, fontWeight: '600' },
  goalProgress: { fontSize: 16, fontWeight: '600' },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  goalText: { fontSize: 14 },
  
  activitiesHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  
  activityCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityInfo: { flex: 1 },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: { fontSize: 18, fontWeight: '600' },
  activityDuration: { fontSize: 14, fontWeight: '500' },
  activityDescription: { fontSize: 14, lineHeight: 20 },
  
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  
  recentHeader: { marginTop: 8, marginBottom: 16 },
  recentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentText: { marginLeft: 12, fontSize: 14 },
});