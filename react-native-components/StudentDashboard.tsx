import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';
import api from '../services/api';

interface DashboardStats {
  attendancePercentage: number;
  totalClasses: number;
  upcomingPayment: number;
  totalBadges: number;
  currentLevel: number;
  totalPoints: number;
}

const StudentDashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/mobile/student/dashboard'],
    queryFn: () => api.get('/mobile/student/dashboard').then(res => res.data),
    retry: 1,
  });

  const { data: upcomingClasses, isLoading: classesLoading } = useQuery({
    queryKey: ['/mobile/student/upcoming-classes'],
    queryFn: () => api.get('/mobile/student/upcoming-classes').then(res => res.data),
    retry: 1,
  });

  const { data: recentBadges, isLoading: badgesLoading } = useQuery({
    queryKey: ['/mobile/student/recent-badges'],
    queryFn: () => api.get('/mobile/student/recent-badges').then(res => res.data),
    retry: 1,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const stats: DashboardStats = dashboardData || {
    attendancePercentage: 0,
    totalClasses: 0,
    upcomingPayment: 0,
    totalBadges: 0,
    currentLevel: 1,
    totalPoints: 0
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeLeft}>
            <Image
              source={require('./assets/psa-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.welcomeTitle}>Welcome back!</Text>
              <Text style={styles.welcomeSubtitle}>Ready for today's training?</Text>
            </View>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelValue}>Level {stats.currentLevel}</Text>
            <Text style={styles.pointsValue}>{stats.totalPoints} points</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
            <Icon name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.attendancePercentage}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Icon name="calendar" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.totalClasses}</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#FFF8E1' }]}>
            <Icon name="award" size={24} color="#FFC107" />
            <Text style={styles.statValue}>{stats.totalBadges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <Icon name="credit-card" size={24} color="#9C27B0" />
            <Text style={styles.statValue}>₹{stats.upcomingPayment}</Text>
            <Text style={styles.statLabel}>Due Soon</Text>
          </View>
        </View>
      </View>

      {/* Progress Card */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="trending-up" size={20} color="#333" />
          <Text style={styles.sectionTitle}>Your Progress</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Attendance Goal</Text>
              <Text style={styles.progressValue}>{stats.attendancePercentage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${stats.attendancePercentage}%` }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Level Progress</Text>
              <Text style={styles.progressValue}>{stats.totalPoints % 100}/100</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(stats.totalPoints % 100)}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>

      {/* Upcoming Classes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="clock" size={20} color="#333" />
          <Text style={styles.sectionTitle}>Upcoming Classes</Text>
        </View>
        
        {classesLoading ? (
          <ActivityIndicator style={styles.sectionLoader} color="#0066cc" />
        ) : upcomingClasses && upcomingClasses.length > 0 ? (
          <View style={styles.classesContainer}>
            {upcomingClasses.map((class_: any) => (
              <View key={class_.id} style={styles.classCard}>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{class_.sport?.name}</Text>
                  <Text style={styles.classDetails}>
                    {format(new Date(class_.date), 'MMM dd, yyyy')} • {class_.timeSlot}
                  </Text>
                </View>
                <View style={styles.coachBadge}>
                  <Text style={styles.coachText}>{class_.coach?.name}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="calendar" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No upcoming classes</Text>
          </View>
        )}
      </View>

      {/* Recent Badges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="star" size={20} color="#333" />
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
        </View>
        
        {badgesLoading ? (
          <ActivityIndicator style={styles.sectionLoader} color="#0066cc" />
        ) : recentBadges && recentBadges.length > 0 ? (
          <View style={styles.badgesContainer}>
            {recentBadges.map((badge: any) => (
              <View key={badge.id} style={styles.badgeItem}>
                <View style={styles.badgeIcon}>
                  <Text style={styles.badgeEmoji}>{badge.badge?.icon}</Text>
                </View>
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>{badge.badge?.name}</Text>
                  <Text style={styles.badgeDate}>
                    Earned {format(new Date(badge.earnedAt), 'MMM dd, yyyy')}
                  </Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>+{badge.badge?.points} pts</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="star" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No achievements yet. Keep working hard!</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="calendar" size={24} color="#fff" />
            <Text style={styles.actionText}>View Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="credit-card" size={24} color="#fff" />
            <Text style={styles.actionText}>Pay Fees</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="award" size={24} color="#fff" />
            <Text style={styles.actionText}>View Badges</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="users" size={24} color="#fff" />
            <Text style={styles.actionText}>Contact Coach</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  welcomeCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#667eea',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
  },
  levelInfo: {
    alignItems: 'flex-end',
  },
  levelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointsValue: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 2,
  },
  statsContainer: {
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  sectionLoader: {
    marginVertical: 20,
  },
  progressContainer: {
    gap: 16,
  },
  progressItem: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  progressValue: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  classesContainer: {
    gap: 12,
  },
  classCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  classDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  coachBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  coachText: {
    fontSize: 12,
    color: '#666',
  },
  badgesContainer: {
    gap: 12,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeEmoji: {
    fontSize: 20,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  badgeDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  pointsBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
});

export default StudentDashboard;