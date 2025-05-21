import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth, googleProvider } from "./firebaseConfig";

// Authorized email addresses that can edit content
const AUTHORIZED_EMAILS = ["harshal.arakala@gmail.com"];

// Check if a user is authorized to edit content
export const isAuthorizedEditor = (user: User | null): boolean => {
  if (!user || !user.email) return false;
  return AUTHORIZED_EMAILS.includes(user.email);
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<{user: User; isAuthorized: boolean} | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const isAuthorized = isAuthorizedEditor(result.user);
    return { user: result.user, isAuthorized };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return null;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
}; 