import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setTeam, addMember, removeMember, setCaptain } from '@/store/teamSlice';

interface TeamMemberForm {
  name: string;
}

export const TeamScreen = () => {
  const dispatch = useDispatch();
  const team = useSelector((state: RootState) => state.team);
  const [teamName, setTeamName] = useState(team.name);
  const [memberForm, setMemberForm] = useState<TeamMemberForm>({ name: '' });
  const [showMemberForm, setShowMemberForm] = useState(false);

  const handleSaveTeam = () => {
    if (teamName.trim()) {
      dispatch(setTeam({ name: teamName.trim() }));
    }
  };

  const handleAddMember = () => {
    if (memberForm.name.trim()) {
      const newMember = {
        id: Date.now().toString(),
        name: memberForm.name.trim(),
        status: 'active' as const,
        distanceCovered: 0,
        lastUpdate: Date.now(),
      };
      dispatch(addMember(newMember));
      setMemberForm({ name: '' });
      setShowMemberForm(false);

      // Set first member as captain if none exists
      if (!team.captainId) {
        dispatch(setCaptain(newMember.id));
      }
    }
  };

  const handleRemoveMember = (memberId: string) => {
    dispatch(removeMember(memberId));
    // If captain is removed, assign new captain
    if (team.captainId === memberId && team.members.length > 1) {
      const remainingMembers = team.members.filter(m => m.id !== memberId);
      if (remainingMembers.length > 0) {
        dispatch(setCaptain(remainingMembers[0].id));
      }
    }
  };

  const handleSetCaptain = (memberId: string) => {
    dispatch(setCaptain(memberId));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Team Management</Text>

      {/* Team Setup */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Information</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Team Name</Text>
          <TextInput
            style={styles.input}
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name"
            placeholderTextColor="#bdc3c7"
          />
          <TouchableOpacity
            style={[
              styles.saveButton,
              !teamName.trim() && styles.saveButtonDisabled
            ]}
            onPress={handleSaveTeam}
            disabled={!teamName.trim()}
          >
            <Text style={styles.saveButtonText}>Save Team</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Team Members */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Team Members ({team.members.length})</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowMemberForm(!showMemberForm)}
          >
            <Text style={styles.addButtonText}>
              {showMemberForm ? 'Cancel' : 'Add Member'}
            </Text>
          </TouchableOpacity>
        </View>

        {showMemberForm && (
          <View style={styles.memberForm}>
            <TextInput
              style={styles.input}
              value={memberForm.name}
              onChangeText={(text) => setMemberForm({ name: text })}
              placeholder="Member name"
              placeholderTextColor="#bdc3c7"
            />
            <TouchableOpacity
              style={[
                styles.addMemberButton,
                !memberForm.name.trim() && styles.addMemberButtonDisabled
              ]}
              onPress={handleAddMember}
              disabled={!memberForm.name.trim()}
            >
              <Text style={styles.addMemberButtonText}>Add Member</Text>
            </TouchableOpacity>
          </View>
        )}

        {team.members.length === 0 ? (
          <Text style={styles.emptyText}>No team members added yet</Text>
        ) : (
          team.members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberStatus}>
                  Status: {member.status.toUpperCase()}
                </Text>
                {member.lastLocation && (
                  <Text style={styles.memberLocation}>
                    Last update: {new Date(member.lastUpdate).toLocaleTimeString()}
                  </Text>
                )}
              </View>

              <View style={styles.memberActions}>
                {team.captainId === member.id ? (
                  <Text style={styles.captainBadge}>CAPTAIN</Text>
                ) : (
                  <TouchableOpacity
                    style={styles.makeCaptainButton}
                    onPress={() => handleSetCaptain(member.id)}
                  >
                    <Text style={styles.makeCaptainButtonText}>Make Captain</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveMember(member.id)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Team Summary */}
      {team.members.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Summary</Text>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Total Members: {team.members.length}
            </Text>
            <Text style={styles.summaryText}>
              Captain: {team.members.find(m => m.id === team.captainId)?.name || 'None'}
            </Text>
            <Text style={styles.summaryText}>
              Active Members: {team.members.filter(m => m.status === 'active').length}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#7f8c8d',
  },
  input: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#27ae60',
    padding: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  memberForm: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  addMemberButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addMemberButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  addMemberButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#bdc3c7',
    fontStyle: 'italic',
    padding: 20,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 10,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  memberStatus: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  memberLocation: {
    fontSize: 10,
    color: '#bdc3c7',
  },
  memberActions: {
    alignItems: 'flex-end',
    gap: 5,
  },
  captainBadge: {
    backgroundColor: '#f39c12',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  makeCaptainButton: {
    backgroundColor: '#f39c12',
    padding: 5,
    borderRadius: 3,
  },
  makeCaptainButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    padding: 5,
    borderRadius: 3,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryContainer: {
    gap: 5,
  },
  summaryText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});