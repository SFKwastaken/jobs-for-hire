import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  userId: string;
  username?: string;
  profile_picture?: string;
  onboarding_completed: boolean;
  target_roles: string[];
  alternative_roles: string[];
  job_categories: string[];
  skills: string[];
  experience_level: string;
  experience_years: string;
  location: {
    country: string;
    state: string;
    city: string;
  };
  work_preference: string;
  preferred_locations: string[];
  salary: {
    minimum: number | null;
    desired: number | null;
    currency: string;
    period: string;
  };
  job_types: string[];
  industries: string[];
  company_preferences: string[];
  education: {
    level: string;
    field: string;
  };
  certifications: string[];
  portfolio: string[];
  professional_links: string[];
  career_priorities: string[];
  availability: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches the user profile from Firestore or localStorage fallback.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  let profile = null;

  if (db) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        profile = docSnap.data() as UserProfile;
        // Keep local storage in sync
        if (typeof window !== 'undefined') {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
        }
        return profile;
      }
    } catch (error: any) {
      if (error.code !== 'unavailable' && !error.message?.includes('offline')) {
        console.error("Error fetching user profile:", error);
      }
    }
  }

  // Fallback to localStorage if Firebase fails or is offline
  if (typeof window !== 'undefined') {
    const localData = localStorage.getItem(`profile_${userId}`);
    if (localData) {
      try {
        profile = JSON.parse(localData) as UserProfile;
        console.log("Loaded profile from localStorage fallback");
        return profile;
      } catch (e) {
        console.error("Failed to parse local profile data", e);
      }
    }
  }
  
  return null;
}

/**
 * Saves or updates a user profile in Firestore and localStorage.
 */
export async function saveUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const now = new Date().toISOString();
  
  // Always save to localStorage as a fallback
  if (typeof window !== 'undefined') {
    try {
      const existingStr = localStorage.getItem(`profile_${userId}`);
      const existing = existingStr ? JSON.parse(existingStr) : { userId, created_at: now };
      const updated = { ...existing, ...data, updated_at: now };
      localStorage.setItem(`profile_${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }

  if (!db) return;
  
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, { ...data, updated_at: now });
    } else {
      await setDoc(docRef, {
        userId,
        ...data,
        created_at: now,
        updated_at: now,
      });
    }
  } catch (error: any) {
    if (error.code !== 'unavailable' && !error.message?.includes('offline')) {
      console.error("Error saving user profile to Firebase:", error);
    }
  }
}
