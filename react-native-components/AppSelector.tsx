import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

const AppSelector: React.FC = () => {
  const navigation = useNavigation();

  const handleCoachPress = () => {
    navigation.navigate('Login' as never, { userType: 'coach' } as never);
  };

  const handleStudentPress = () => {
    navigation.navigate('Login' as never, { userType: 'student' } as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0066cc" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="smartphone" size={48} color="#0066cc" />
          </View>
          <Text style={styles.title}>Parmanand Sports Academy</Text>
          <Text style={styles.subtitle}>Select your app to continue</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionCard, styles.coachCard]}
            onPress={handleCoachPress}
            activeOpacity={0.8}
          >
            <View style={styles.optionIcon}>
              <Icon name="users" size={32} color="#0066cc" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Coach App</Text>
              <Text style={styles.optionDescription}>
                Manage classes, mark attendance, and track student progress
              </Text>
            </View>
            <View style={styles.optionArrow}>
              <Icon name="chevron-right" size={24} color="#666" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, styles.studentCard]}
            onPress={handleStudentPress}
            activeOpacity={0.8}
          >
            <View style={styles.optionIcon}>
              <Icon name="user" size={32} color="#4CAF50" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Student App</Text>
              <Text style={styles.optionDescription}>
                View schedules, attendance, payments, and achievements
              </Text>
            </View>
            <View style={styles.optionArrow}>
              <Icon name="chevron-right" size={24} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need help? Contact your academy administrator
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  coachCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  studentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionArrow: {
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 60,
  },
  footerText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AppSelector;