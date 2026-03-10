import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setTeam, addMember, removeMember, setCaptain, updateMemberStatus } from '@/store/teamSlice';

interface TeamManagementProps {
  onMemberSelect?: (memberId: string) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ onMemberSelect }) => {
  const dispatch = useDispatch();
  const team = useSelector((state: RootState) => state.team);
  const race = useSelector((state: RootState) => state.race);

  const [teamName, setTeamName] = useState(team.name);
  const [newMemberName, setNewMemberName] = useState('');
  const [showMemberForm, setShowMemberForm] = useState(false);

  const handleSaveTeam = () => {
    if (teamName.trim()) {
      dispatch(setTeam({ name: teamName.trim() }));
    }
  };

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      const newMember = {
        id: Date.now().toString(),
        name: newMemberName.trim(),
        status: 'active' as const,
        distanceCovered: 0,
        lastUpdate: Date.now(),
      };
      dispatch(addMember(newMember));
      setNewMemberName('');
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

  const handleUpdateMemberStatus = (memberId: string, status: 'active' | 'paused' | 'completed' | 'dropped') => {
    dispatch(updateMemberStatus({ memberId, status }));
  };

  const formatLastUpdate = (timestamp: number): string => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes === 0) return 'Just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#27ae60';
      case 'paused': return '#f39c12';
      case 'completed': return '#3498db';
      case 'dropped': return '#e74c3c';
      default: return '#bdc3c7';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Team Information */}
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

        {/* Team Summary */}
        {team.members.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Team Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{team.members.length}</Text>
                <Text style={styles.summaryLabel}>Total Members</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {team.members.filter(m => m.status === 'active').length}
                </Text>
                <Text style={styles.summaryLabel}>Active</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {team.captainId ? team.members.find(m => m.id === team.captainId)?.name || 'None' : 'None'}
                </Text>
                <Text style={styles.summaryLabel}>Captain</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Add Member */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Team Members ({team.members.length})
          </Text>
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
              value={newMemberName}
              onChangeText={setNewMemberName}
              placeholder="Member name"
              placeholderTextColor="#bdc3c7"
            />
            <TouchableOpacity
              style={[
                styles.addMemberButton,
                !newMemberName.trim() && styles.addMemberButtonDisabled
              ]}
              onPress={handleAddMember}
              disabled={!newMemberName.trim()}
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
                <View style={styles.memberDetails}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(member.status) }
                  ]} />
                  <Text style={styles.memberStatus}>{member.status.toUpperCase()}</Text>
                  {member.lastLocation && (
                    <Text style={styles.lastUpdate}>
                      {formatLastUpdate(member.lastUpdate)}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.memberActions}>
                {/* Captain Badge */}
                {team.captainId === member.id ? (
                  <View style={styles.captainBadge}>
                    <Text style={styles.captainText}>CAPTAIN</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.makeCaptainButton}
                    onPress={() => handleSetCaptain(member.id)}
                  >
                    <Text style={styles.makeCaptainText}>Make Captain</Text>
                  </TouchableOpacity>
                )}

                {/* Status Controls */}
                <View style={styles.statusButtons}>
                  {race.status === 'active' && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.statusButton,
                          member.status === 'active' && styles.statusButtonActive
                        ]}
                        onPress={() => handleUpdateMemberStatus(member.id, 'active')}
                      >
                        <Text style={[
                          styles.statusButtonText,
                          member.status === 'active' && styles.statusButtonTextActive
                        ]}>
                          Active
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.statusButton,
                          member.status === 'paused' && styles.statusButtonActive
                        ]}
                        onPress={() => handleUpdateMemberStatus(member.id, 'paused')}
                      >
                        <Text style={[
                          styles.statusButtonText,
                          member.status === 'paused' && styles.statusButtonTextActive
                        ]}>
                          Pause
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      member.status === 'completed' && styles.statusButtonActive
                    ]}
                    onPress={() => handleUpdateMemberStatus(member.id, 'completed')}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      member.status === 'completed' && styles.statusButtonTextActive
                    ]}>
                      Finish
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      member.status === 'dropped' && styles.statusButtonActive
                    ]}
                    onPress={() => handleUpdateMemberStatus(member.id, 'dropped')}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      member.status === 'dropped' && styles.statusButtonTextActive
                    ]}>
                      Drop
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Remove Button */}
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

      {/* Race Status */}
      {race.status !== 'pre-race' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Race Status</Text>
          <View style={styles.raceStatusContainer}>
            <Text style={styles.raceStatusText}>
              Race: {race.status.toUpperCase()}
            </Text>
            <Text style={styles.raceName}>{race.name}</Text>
            <Text style={styles.raceType}>{race.type.toUpperCase()} • {race.distance / 1000}km</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
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
    color: '#2c3e50',
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
  summaryContainer: {
    marginTop: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495e',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
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
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  memberInfo: {
    marginBottom: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  memberDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  memberStatus: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  lastUpdate: {
    fontSize: 10,
    color: '#bdc3c7',
  },
  memberActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  captainBadge: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  captainText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  makeCaptainButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  makeCaptainText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 5,
    flex: 1,
    justifyContent: 'center',
  },
  statusButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#ecf0f1',
  },
  statusButtonActive: {
    backgroundColor: '#3498db',
  },
  statusButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  statusButtonTextActive: {
    color: 'white',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  raceStatusContainer: {
    alignItems: 'center',
  },
  raceStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5,
  },
  raceName: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 2,
  },
  raceType: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default TeamManagement;