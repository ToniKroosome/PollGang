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
  }
};

export { db };