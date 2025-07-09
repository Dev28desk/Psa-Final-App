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
  totalStudents: number;
  activeClasses: number;
  todayAttendance: number;
  thisWeekClasses: number;
}

interface TodayClass {
  id: number;
  sport: { name: string };
  name: string;
  timeSlot: string;
  studentsCount: number;
  status: string;
}

const CoachDashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/mobile/coach/dashboard'],
    queryFn: () => api.get('/mobile/coach/dashboard').then(res => res.data),
    retry: 1,
  });

  const { data: todayClasses, isLoading: classesLoading } = useQuery({
    queryKey: ['/mobile/coach/today-classes'],
    queryFn: () => api.get('/mobile/coach/today-classes').then(res => res.data),
    retry: 1,
  });

  const { data: recentAttendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ['/mobile/coach/recent-attendance'],
    queryFn: () => api.get('/mobile/coach/recent-attendance').then(res => res.data),
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
    totalStudents: 0,
    activeClasses: 0,
    todayAttendance: 0,
    thisWeekClasses: 0
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
              <Text style={styles.welcomeTitle}>Welcome back, Coach!</Text>
              <Text style={styles.welcomeSubtitle}>Ready to train champions?</Text>
            </View>
          </View>
          <View style={styles.activeIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Icon name="users" size={24} color="#1976D2" />
            <Text style={styles.statValue}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
            <Icon name="calendar" size={24} color="#388E3C" />
            <Text style={styles.statValue}>{stats.activeClasses}</Text>
            <Text style={styles.statLabel}>Active Classes</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <Icon name="check-circle" size={24} color="#7B1FA2" />
            <Text style={styles.statValue}>{stats.todayAttendance}</Text>
            <Text style={styles.statLabel}>Today Present</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Icon name="trending-up" size={24} color="#F57C00" />
            <Text style={styles.statValue}>{stats.thisWeekClasses}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>
      </View>

      {/* Today's Classes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="clock" size={20} color="#333" />
          <Text style={styles.sectionTitle}>Today's Classes</Text>
        </View>
        
        {classesLoading ? (
          <ActivityIndicator style={styles.sectionLoader} color="#0066cc" />
        ) : todayClasses && todayClasses.length > 0 ? (
          <View style={styles.classesContainer}>
            {todayClasses.map((class_: TodayClass) => (
              <View key={class_.id} style={styles.classCard}>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>
                    {class_.sport?.name} - {class_.name}
                  </Text>
                  <Text style={styles.classDetails}>
                    {class_.timeSlot} • {class_.studentsCount} students
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: class_.status === 'active' ? '#4CAF50' : '#9E9E9E' }
                ]}>
                  <Text style={styles.statusText}>{class_.status}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="calendar" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No classes scheduled for today</Text>
          </View>
        )}
      </View>

      {/* Recent Attendance */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="check-circle" size={20} color="#333" />
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
        </View>
        
        {attendanceLoading ? (
          <ActivityIndicator style={styles.sectionLoader} color="#0066cc" />
        ) : recentAttendance && recentAttendance.length > 0 ? (
          <View style={styles.attendanceContainer}>
            {recentAttendance.map((attendance: any) => (
              <View key={attendance.id} style={styles.attendanceItem}>
                <View>
                  <Text style={styles.studentName}>{attendance.student?.name}</Text>
                  <Text style={styles.attendanceDate}>
                    {format(new Date(attendance.date), 'MMM dd, yyyy')}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: attendance.status === 'present' ? '#4CAF50' : '#f44336' }
                ]}>
                  <Text style={styles.statusText}>{attendance.status}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="check-circle" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No recent attendance records</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="check-circle" size={24} color="#fff" />
            <Text style={styles.actionText}>Mark Attendance</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="calendar" size={24} color="#fff" />
            <Text style={styles.actionText}>View Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="users" size={24} color="#fff" />
            <Text style={styles.actionText}>View Students</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="map-pin" size={24} color="#fff" />
            <Text style={styles.actionText}>Check Location</Text>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    marginHorizontal: 16,
    elevation: 3,
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
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  statsContainer: {
    padding: 16,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  attendanceContainer: {
    gap: 12,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  attendanceDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
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

export default CoachDashboard;