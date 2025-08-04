import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";

// Using the same Firebase project as your main app
const firebaseConfig = {
  apiKey: "AIzaSyDaOTskWhQHnnQhQP_zJjHQosiuor5JYJ8",
  authDomain: "upgradefreelance.firebaseapp.com",
  projectId: "upgradefreelance",
  storageBucket: "upgradefreelance.firebasestorage.app",
  messagingSenderId: "734763064075",
  appId: "1:734763064075:web:your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Film05 Vote specific Firebase functions
export const film05Service = {
  // Save submission to Firebase
  async saveSubmission(submissionData) {
    try {
      const docRef = doc(db, 'film05_submissions', submissionData.name);
      await setDoc(docRef, {
        ...submissionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Film05 submission saved:', submissionData.name);
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving Film05 submission:', error);
      return { success: false, error: error.message };
    }
  },

  // Load all submissions from Firebase
  async loadSubmissions() {
    try {
      const submissionsRef = collection(db, 'film05_submissions');
      const snapshot = await getDocs(submissionsRef);
      const submissions = {};
      
      snapshot.forEach((doc) => {
        submissions[doc.id] = doc.data();
      });
      
      console.log('✅ Film05 submissions loaded:', Object.keys(submissions).length);
      return { success: true, data: submissions };
    } catch (error) {
      console.error('❌ Error loading Film05 submissions:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete submission from Firebase
  async deleteSubmission(submissionName) {
    try {
      const docRef = doc(db, 'film05_submissions', submissionName);
      await deleteDoc(docRef);
      console.log('✅ Film05 submission deleted:', submissionName);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting Film05 submission:', error);
      return { success: false, error: error.message };
    }
  },

  // Real-time listener for submissions
  subscribeToSubmissions(callback) {
    const submissionsRef = collection(db, 'film05_submissions');
    return onSnapshot(submissionsRef, (snapshot) => {
      const submissions = {};
      snapshot.forEach((doc) => {
        submissions[doc.id] = doc.data();
      });
      callback(submissions);
    });
  },

  // Poll management functions
  async createPoll(pollData) {
    try {
      const pollId = `poll_${pollData.month}_${pollData.year}`;
      const docRef = doc(db, 'film05_polls', pollId);
      await setDoc(docRef, {
        ...pollData,
        id: pollId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      });
      console.log('✅ Film05 poll created:', pollId);
      return { success: true, pollId };
    } catch (error) {
      console.error('❌ Error creating Film05 poll:', error);
      return { success: false, error: error.message };
    }
  },

  async loadPolls() {
    try {
      const pollsRef = collection(db, 'film05_polls');
      const snapshot = await getDocs(pollsRef);
      const polls = {};
      
      snapshot.forEach((doc) => {
        polls[doc.id] = doc.data();
      });
      
      console.log('✅ Film05 polls loaded:', Object.keys(polls).length);
      return { success: true, data: polls };
    } catch (error) {
      console.error('❌ Error loading Film05 polls:', error);
      return { success: false, error: error.message };
    }
  },

  subscribeToPolls(callback) {
    const pollsRef = collection(db, 'film05_polls');
    return onSnapshot(pollsRef, (snapshot) => {
      const polls = {};
      snapshot.forEach((doc) => {
        polls[doc.id] = doc.data();
      });
      callback(polls);
    });
  },

  async deletePoll(pollId) {
    try {
      const docRef = doc(db, 'film05_polls', pollId);
      await deleteDoc(docRef);
      console.log('✅ Film05 poll deleted:', pollId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting Film05 poll:', error);
      return { success: false, error: error.message };
    }
  },

  // Time availability functions
  async saveTimeAvailability(timeData) {
    try {
      // Validate that name exists and is not empty
      if (!timeData.name || timeData.name.trim() === '') {
        console.error('❌ Cannot save time availability: name is empty');
        return { success: false, error: 'Name is required and cannot be empty' };
      }
      
      const docRef = doc(db, 'film05_time_availability', timeData.name.trim());
      await setDoc(docRef, {
        ...timeData,
        name: timeData.name.trim(), // Ensure name is trimmed
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Film05 time availability saved:', timeData.name.trim());
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving Film05 time availability:', error);
      return { success: false, error: error.message };
    }
  },

  async loadTimeAvailability() {
    try {
      const timeRef = collection(db, 'film05_time_availability');
      const snapshot = await getDocs(timeRef);
      const timeData = {};
      
      snapshot.forEach((doc) => {
        timeData[doc.id] = doc.data();
      });
      
      console.log('✅ Film05 time availability loaded:', Object.keys(timeData).length);
      return { success: true, data: timeData };
    } catch (error) {
      console.error('❌ Error loading Film05 time availability:', error);
      return { success: false, error: error.message };
    }
  },

  subscribeToTimeAvailability(callback) {
    const timeRef = collection(db, 'film05_time_availability');
    return onSnapshot(timeRef, (snapshot) => {
      const timeData = {};
      snapshot.forEach((doc) => {
        timeData[doc.id] = doc.data();
      });
      callback(timeData);
    });
  },

  async deleteTimeAvailability(userName) {
    try {
      const docRef = doc(db, 'film05_time_availability', userName);
      await deleteDoc(docRef);
      console.log('✅ Film05 time availability deleted:', userName);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting Film05 time availability:', error);
      return { success: false, error: error.message };
    }
  }
};

export { db };