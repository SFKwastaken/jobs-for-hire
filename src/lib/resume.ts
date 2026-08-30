import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Resume } from '../types/resume';

/**
 * Saves a newly generated resume to Firestore
 */
export async function saveResume(resume: Omit<Resume, 'createdAt' | 'updatedAt'>): Promise<Resume> {
  if (!db) throw new Error("Firebase DB not initialized");
  
  const resumeRef = doc(db, 'resumes', resume.id);
  const now = new Date().toISOString();
  
  const newResume: Resume = {
    ...resume,
    createdAt: now,
    updatedAt: now
  };
  
  // Firestore throws an error if there are any 'undefined' values in the object.
  // Stripping undefined values using JSON serialization.
  const cleanResume = JSON.parse(JSON.stringify(newResume));
  
  await setDoc(resumeRef, cleanResume);
  return newResume;
}

/**
 * Updates an existing resume
 */
export async function updateResume(id: string, updates: Partial<Resume>): Promise<void> {
  if (!db) throw new Error("Firebase DB not initialized");
  
  const resumeRef = doc(db, 'resumes', id);
  await updateDoc(resumeRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Gets a specific resume by ID
 */
export async function getResume(id: string): Promise<Resume | null> {
  if (!db) return null;
  
  const docSnap = await getDoc(doc(db, 'resumes', id));
  if (docSnap.exists()) {
    return docSnap.data() as Resume;
  }
  return null;
}

/**
 * Gets all resumes for a specific user
 */
export async function getUserResumes(userId: string): Promise<Resume[]> {
  if (!db) return [];
  
  const q = query(collection(db, 'resumes'), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  const resumes: Resume[] = [];
  querySnapshot.forEach((doc) => {
    resumes.push(doc.data() as Resume);
  });
  
  // Sort by updatedAt descending
  return resumes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Deletes a resume
 */
export async function deleteResume(id: string): Promise<void> {
  if (!db) throw new Error("Firebase DB not initialized");
  await deleteDoc(doc(db, 'resumes', id));
}
