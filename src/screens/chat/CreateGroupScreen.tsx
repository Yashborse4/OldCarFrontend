import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { ThemeContextType } from '../../theme/ThemeContext';

import { GroupDetailsRouteProp } from '../../navigation/types';
// import { Input } from '../../components/UI/Input'; // Update this path based on your project structure

const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a group description');
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      const newGroup = {
        id: Date.now().toString(),
        name: groupName.trim(),
        description: description.trim(),
        isPrivate,
        adminId: 'current-dealer-id', // Replace with current user ID
        members: [
          {
            id: 'current-dealer-id',
            name: 'Current User', // Replace with current user name
            dealership: 'Current Dealership', // Replace with current user dealership
            role: 'admin' as const,
          },
        ],
        createdAt: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Success!',
        'Group created successfully. You can now invite members.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to group details screen
              navigation.navigate('GroupDetails', { groupId: newGroup.id });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create group. Please try again.');
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Group Name *</Text>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name (e.g., Luxury Car Dealers Network)"
              maxLength={50}
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the purpose and focus of your group"
              multiline
              numberOfLines={4}
              maxLength={200}
              style={[styles.textInput, styles.textArea]}
            />
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.privacyOption}>
            <View style={styles.privacyInfo}>
              <View style={styles.privacyHeader}>
                <Icon
                  name={isPrivate ? 'lock' : 'public'}
                  size={20}
                  color={isPrivate ? '#FF6B6B' : '#4ECDC4'}
                />
                <Text style={styles.privacyTitle}>
                  {isPrivate ? 'Private Group' : 'Public Group'}
                </Text>
              </View>
              <Text style={styles.privacyDescription}>
                {isPrivate
                  ? 'Only invited members can join and see group content'
                  : 'Anyone can discover, request to join, and see group content'
                }
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#4ECDC4', true: '#FF6B6B' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Features</Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <MaterialIcons name="share" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>Co-list vehicles with members</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="chat" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>Private messaging with dealers</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="notifications" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>Real-time notifications</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="analytics" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>Performance analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="group" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>Member management tools</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <Text style={styles.nextStepsText}>
            After creating your group, you can:
          </Text>
          <Text style={styles.nextStepItem}>• Invite other dealers to join</Text>
          <Text style={styles.nextStepItem}>• Set up group rules and guidelines</Text>
          <Text style={styles.nextStepItem}>• Start sharing vehicle listings</Text>
          <Text style={styles.nextStepItem}>• Begin networking with members</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateGroup}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.createButtonText}>Creating...</Text>
            </View>
          ) : (
            <Text style={styles.createButtonText}>Create Group</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
  },
  privacyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  privacyInfo: {
    flex: 1,
    marginRight: 16,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featureList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  nextStepsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  nextStepItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  createButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CreateGroupScreen;
