import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export type Season = 'Fall' | 'Spring' | 'Summer';
export type PositionType = 'Co-Op' | 'Intern' | 'New Grad' | 'SWE1' | 'SWE2' | 'Senior SWE';
export type PayType = 'Hourly' | 'Yearly';
export type InterviewRound = 'Technical' | 'Super Day' | 'Hiring Manager' | 'Behavioral' | 'Phone Screen';
export type WorkType = 'Remote' | 'Hybrid' | 'In Person';

export interface Interview {
  id?: string;
  companyName: string;
  companyImageUrl: string;
  positionName: string;
  location?: string | null;
  workType?: WorkType | null;
  season: Season;
  year: number;
  positionType: PositionType;
  offer: boolean;
  pay?: number | null; // Only if offer is true
  payType?: PayType | null; // Only if offer is true
  round?: InterviewRound | null; // Only if offer is false
  rating?: number | null; // Public rating 1-5 stars
  interviewNotes: string; // Private notes
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Collection reference
const interviewsCollection = collection(db, "interviews");

// Get all interviews
export const getInterviews = async (): Promise<Interview[]> => {
  try {
    const snapshot = await getDocs(interviewsCollection);
    return snapshot.docs.map((doc: any) => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Interview));
  } catch (error) {
    console.error("Error fetching interviews:", error);
    throw error;
  }
};

// Create a new interview
export const createInterview = async (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const newInterview = {
      ...interview,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(interviewsCollection, newInterview);
    return docRef.id;
  } catch (error) {
    console.error("Error adding interview:", error);
    throw error;
  }
};

// Update an existing interview
export const updateInterview = async (interview: Interview): Promise<void> => {
  try {
    if (!interview.id) throw new Error("Interview ID is required");
    
    const docRef = doc(interviewsCollection, interview.id);
    const { id, ...updateData } = interview;
    
    await updateDoc(docRef, { 
      ...updateData, 
      updatedAt: Timestamp.now() 
    });
  } catch (error) {
    console.error("Error updating interview:", error);
    throw error;
  }
};

// Delete an interview
export const deleteInterview = async (interview: Interview): Promise<void> => {
  try {
    if (!interview.id) throw new Error("Interview ID is required");
    
    const docRef = doc(interviewsCollection, interview.id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting interview:", error);
    throw error;
  }
};

