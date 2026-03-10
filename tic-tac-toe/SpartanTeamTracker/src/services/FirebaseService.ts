import { getDatabase, ref, set, onValue, off, push, update } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { store } from '@/store/store';
import { setRace } from '@/store/raceSlice';
import { setTeam, addMember, removeMember, updateMemberStatus, updateMemberLocation } from '@/store/teamSlice';
import { auth, database } from '@/config/firebase';

class FirebaseService {
  private database;
  private auth;
  private isConnected = false;
  private currentRaceRef: any = null;
  private currentTeamRef: any = null;

  constructor() {
    this.database = database;
    this.auth = auth;
    this.setupAuth();
  }

  /**
   * Setup anonymous authentication
   */
  private async setupAuth(): Promise<void> {
    try {
      await signInAnonymously(this.auth);

      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.isConnected = true;
          console.log('Firebase connected anonymously:', user.uid);
        } else {
          this.isConnected = false;
          console.log('Firebase disconnected');
        }
      });
    } catch (error) {
      console.error('Firebase auth error:', error);
      this.isConnected = false;
    }
  }

  /**
   * Create a new race
   */
  async createRace(raceData: {
    name: string;
    type: 'sprint' | 'super' | 'beast' | 'ultra';
    teamName: string;
    members: string[];
  }): Promise<string | null> {
    if (!this.isConnected) return null;

    try {
      const raceRef = push(ref(this.database, 'races'));
      const raceId = raceRef.key;

      const race = {
        id: raceId,
        name: raceData.name,
        type: raceData.type,
        status: 'pre-race',
        startTime: null,
        endTime: null,
        createdAt: Date.now(),
        createdBy: this.auth.currentUser?.uid,
      };

      await set(raceRef, race);

      // Create team
      const teamRef = push(ref(this.database, 'teams'));
      const teamId = teamRef.key;

      const team = {
        id: teamId,
        name: raceData.teamName,
        raceId,
        captainId: this.auth.currentUser?.uid,
        memberIds: raceData.members,
        createdAt: Date.now(),
      };

      await set(teamRef, team);

      // Link race to team
      await update(ref(this.database, `races/${raceId}`), {
        teamId,
      });

      return raceId;
    } catch (error) {
      console.error('Error creating race:', error);
      return null;
    }
  }

  /**
   * Join an existing race
   */
  async joinRace(raceId: string, memberName: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const memberId = this.auth.currentUser?.uid;
      if (!memberId) return false;

      // Add member to team
      const memberRef = ref(this.database, `members/${memberId}`);
      await set(memberRef, {
        id: memberId,
        name: memberName,
        raceId,
        teamId: null, // Will be set when team is loaded
        status: 'active',
        distanceCovered: 0,
        lastUpdate: Date.now(),
        joinedAt: Date.now(),
      });

      return true;
    } catch (error) {
      console.error('Error joining race:', error);
      return false;
    }
  }

  /**
   * Start listening to race updates
   */
  listenToRace(raceId: string): void {
    if (!this.isConnected) return;

    // Stop previous listeners
    this.stopListening();

    // Listen to race updates
    this.currentRaceRef = ref(this.database, `races/${raceId}`);
    onValue(this.currentRaceRef, (snapshot) => {
      const raceData = snapshot.val();
      if (raceData) {
        store.dispatch(setRace(raceData));

        // If race has team, listen to team updates
        if (raceData.teamId) {
          this.listenToTeam(raceData.teamId);
        }
      }
    });
  }

  /**
   * Start listening to team updates
   */
  private listenToTeam(teamId: string): void {
    if (!this.isConnected) return;

    // Listen to team members
    const teamMembersRef = ref(this.database, `teams/${teamId}/memberIds`);
    onValue(teamMembersRef, async (snapshot) => {
      const memberIds = snapshot.val() || [];

      // Listen to each member's location
      memberIds.forEach((memberId: string) => {
        const memberRef = ref(this.database, `members/${memberId}`);
        onValue(memberRef, (memberSnapshot) => {
          const memberData = memberSnapshot.val();
          if (memberData) {
            // Update member in store
            store.dispatch(updateMemberLocation({
              memberId: memberData.id,
              location: memberData.lastLocation,
            }));

            // Update member status
            store.dispatch(updateMemberStatus({
              memberId: memberData.id,
              status: memberData.status,
            }));
          }
        });
      });
    });
  }

  /**
   * Update member location
   */
  async updateMemberLocation(location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  }): Promise<void> {
    if (!this.isConnected || !this.auth.currentUser) return;

    try {
      const memberId = this.auth.currentUser.uid;
      const memberRef = ref(this.database, `members/${memberId}`);

      await update(memberRef, {
        lastLocation: location,
        lastUpdate: Date.now(),
      });
    } catch (error) {
      console.error('Error updating member location:', error);
    }
  }

  /**
   * Update member status
   */
  async updateMemberStatus(status: 'active' | 'paused' | 'completed' | 'dropped'): Promise<void> {
    if (!this.isConnected || !this.auth.currentUser) return;

    try {
      const memberId = this.auth.currentUser.uid;
      const memberRef = ref(this.database, `members/${memberId}`);

      await update(memberRef, {
        status,
        lastUpdate: Date.now(),
      });
    } catch (error) {
      console.error('Error updating member status:', error);
    }
  }

  /**
   * Update race status
   */
  async updateRaceStatus(raceId: string, status: string, data?: any): Promise<void> {
    if (!this.isConnected) return;

    try {
      const raceRef = ref(this.database, `races/${raceId}`);
      const updates: any = { status };

      if (status === 'active' && !data?.startTime) {
        updates.startTime = Date.now();
      } else if (status === 'completed') {
        updates.endTime = Date.now();
      }

      if (data) {
        Object.assign(updates, data);
      }

      await update(raceRef, updates);
    } catch (error) {
      console.error('Error updating race status:', error);
    }
  }

  /**
   * Stop all listeners
   */
  stopListening(): void {
    if (this.currentRaceRef) {
      off(this.currentRaceRef);
      this.currentRaceRef = null;
    }

    if (this.currentTeamRef) {
      off(this.currentTeamRef);
      this.currentTeamRef = null;
    }
  }

  /**
   * Check connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }
}

export const firebaseService = new FirebaseService();