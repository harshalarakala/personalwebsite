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

export interface Experience {
  id?: string;
  title: string;
  company?: string | null;
  media: string;
  duration: string;
  fullDescription: string;
  briefDescription: string;
  location?: string | null;
  archived?: boolean;
  type: 'experience' | 'project';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Collection references
const experiencesCollection = collection(db, "experiences");
const projectsCollection = collection(db, "projects");

// Get all non-archived experiences or projects
export const getItems = async (type: 'experience' | 'project', includeArchived = false): Promise<Experience[]> => {
  try {
    const targetCollection = type === 'experience' ? experiencesCollection : projectsCollection;
    
    let q;
    if (!includeArchived) {
      q = query(
        targetCollection,
        where("archived", "!=", true)
      );
    } else {
      q = query(targetCollection);
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Experience));
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

// Create a new experience or project
export const createItem = async (item: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const targetCollection = item.type === 'experience' ? experiencesCollection : projectsCollection;
    
    const newItem = {
      ...item,
      archived: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(targetCollection, newItem);
    return docRef.id;
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
};

// Update an existing experience or project
export const updateItem = async (item: Experience): Promise<void> => {
  try {
    if (!item.id) throw new Error("Item ID is required");
    
    const targetCollection = item.type === 'experience' ? experiencesCollection : projectsCollection;
    const docRef = doc(targetCollection, item.id);
    
    const { id, ...updateData } = item;
    
    await updateDoc(docRef, { 
      ...updateData, 
      updatedAt: Timestamp.now() 
    });
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

// Archive or unarchive an experience or project
export const toggleArchiveItem = async (item: Experience, archive: boolean): Promise<void> => {
  try {
    if (!item.id) throw new Error("Item ID is required");
    
    const targetCollection = item.type === 'experience' ? experiencesCollection : projectsCollection;
    const docRef = doc(targetCollection, item.id);
    
    await updateDoc(docRef, { 
      archived: archive,
      updatedAt: Timestamp.now() 
    });
  } catch (error) {
    console.error("Error archiving/unarchiving item:", error);
    throw error;
  }
};

// Delete an experience or project
export const deleteItem = async (item: Experience): Promise<void> => {
  try {
    if (!item.id) throw new Error("Item ID is required");
    
    const targetCollection = item.type === 'experience' ? experiencesCollection : projectsCollection;
    const docRef = doc(targetCollection, item.id);
    
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

// Seed initial data from local storage if Firebase collections are empty
export const seedInitialData = async (
  experiences: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>[],
  projects: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> => {
  try {
    // Check if experiences collection is empty
    const expSnapshot = await getDocs(experiencesCollection);
    if (expSnapshot.empty) {
      // Seed experiences
      for (const exp of experiences) {
        await addDoc(experiencesCollection, {
          ...exp,
          archived: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      console.log("Experiences seeded successfully");
    }

    // Check if projects collection is empty
    const projSnapshot = await getDocs(projectsCollection);
    if (projSnapshot.empty) {
      // Seed projects
      for (const proj of projects) {
        await addDoc(projectsCollection, {
          ...proj,
          archived: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      console.log("Projects seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding initial data:", error);
    throw error;
  }
}; 