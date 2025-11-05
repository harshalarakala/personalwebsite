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
import emailjs from 'emailjs-com';

export interface AccessRequest {
  id?: string;
  email: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
}

export interface AccessGrant {
  id?: string;
  email: string;
  grantedAt: Timestamp;
  grantedBy: string;
}

// Collection references
const accessRequestsCollection = collection(db, "interviewAccessRequests");
const accessGrantsCollection = collection(db, "interviewAccessGrants");

// Submit a request for interview notes access
export const submitAccessRequest = async (email: string): Promise<string> => {
  try {
    // Block if there's a pending request
    const pendingQuery = query(
      accessRequestsCollection,
      where("email", "==", email),
      where("status", "==", "pending")
    );
    const pendingRequests = await getDocs(pendingQuery);
    if (!pendingRequests.empty) {
      throw new Error("You already have a pending request");
    }

    // Block if there's an active grant (user already has access)
    const grantsQuery = query(
      accessGrantsCollection,
      where("email", "==", email)
    );
    const grants = await getDocs(grantsQuery);
    if (!grants.empty) {
      throw new Error("You already have access");
    }

    const newRequest = {
      email,
      status: 'pending' as const,
      requestedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(accessRequestsCollection, newRequest);
    
    // Notify owner of new request
    await notifyOwnerOfRequest(email);
    
    return docRef.id;
  } catch (error) {
    console.error("Error submitting access request:", error);
    throw error;
  }
};

// Get all pending access requests (owner only)
export const getPendingAccessRequests = async (): Promise<AccessRequest[]> => {
  try {
    const q = query(
      accessRequestsCollection,
      where("status", "==", "pending")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ 
      id: doc.id, 
      ...doc.data() 
    } as AccessRequest));
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    throw error;
  }
};

// Approve an access request
export const approveAccessRequest = async (
  requestId: string, 
  email: string, 
  reviewerEmail: string
): Promise<void> => {
  try {
    // Update request status
    const requestRef = doc(accessRequestsCollection, requestId);
    await updateDoc(requestRef, {
      status: 'approved',
      reviewedAt: Timestamp.now(),
      reviewedBy: reviewerEmail
    });

    // Check if access grant already exists
    const existingGrantsQuery = query(
      accessGrantsCollection,
      where("email", "==", email)
    );
    const existingGrants = await getDocs(existingGrantsQuery);
    
    if (existingGrants.empty) {
      // Create access grant
      await addDoc(accessGrantsCollection, {
        email,
        grantedAt: Timestamp.now(),
        grantedBy: reviewerEmail
      });
    }
    // Notify via email (approved)
    await sendAccessEmail(email, 'approved');
  } catch (error) {
    console.error("Error approving access request:", error);
    throw error;
  }
};

// Deny an access request
export const denyAccessRequest = async (
  requestId: string,
  email: string,
  reviewerEmail: string
): Promise<void> => {
  try {
    const requestRef = doc(accessRequestsCollection, requestId);
    await updateDoc(requestRef, {
      status: 'denied',
      reviewedAt: Timestamp.now(),
      reviewedBy: reviewerEmail
    });
    // Notify via email (denied)
    await sendAccessEmail(email, 'denied');
  } catch (error) {
    console.error("Error denying access request:", error);
    throw error;
  }
};

// Check if a user has been granted access
export const checkAccessGrant = async (email: string): Promise<boolean> => {
  try {
    const q = query(
      accessGrantsCollection,
      where("email", "==", email)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking access grant:", error);
    return false;
  }
};

// Check if a user has a pending or approved request
export const checkUserRequestStatus = async (email: string): Promise<'pending' | 'approved' | 'denied' | 'none'> => {
  try {
    // Check for pending request first
    const pendingSnap = await getDocs(query(
      accessRequestsCollection,
      where('email', '==', email),
      where('status', '==', 'pending')
    ));
    if (!pendingSnap.empty) return 'pending';

    // Consider a user "approved" ONLY if there is an active grant
    const grantsSnap = await getDocs(query(
      accessGrantsCollection,
      where('email', '==', email)
    ));
    if (!grantsSnap.empty) return 'approved';

    // If previously denied, allow re-request → treat as 'none'
    return 'none';
  } catch (error) {
    console.error("Error checking user request status:", error);
    return 'none';
  }
};

// List all active grants (owner)
export const getAccessGrants = async (): Promise<AccessGrant[]> => {
  try {
    const snapshot = await getDocs(accessGrantsCollection);
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as AccessGrant));
  } catch (error) {
    console.error('Error fetching access grants:', error);
    throw error;
  }
};

// Revoke a grant by id
export const revokeAccessGrant = async (grantId: string): Promise<void> => {
  try {
    const grantRef = doc(accessGrantsCollection, grantId);
    await deleteDoc(grantRef);
  } catch (error) {
    console.error('Error revoking access grant:', error);
    throw error;
  }
};

// Manually grant access (no email notification to recipient)
export const manuallyGrantAccess = async (email: string, granterEmail: string): Promise<void> => {
  try {
    // Check if access grant already exists
    const existingGrantsQuery = query(
      accessGrantsCollection,
      where("email", "==", email)
    );
    const existingGrants = await getDocs(existingGrantsQuery);
    
    if (existingGrants.empty) {
      // Create access grant
      await addDoc(accessGrantsCollection, {
        email,
        grantedAt: Timestamp.now(),
        grantedBy: granterEmail
      });
    }
  } catch (error) {
    console.error('Error manually granting access:', error);
    throw error;
  }
};

// Email notifications (using EmailJS like Contact form)
const EMAILJS_SERVICE_ID = 'service_agvp2sz';
const EMAILJS_TEMPLATE_ID = 'template_b0trd35';
const EMAILJS_PUBLIC_KEY = 'eq_7G2CPHOva33sEn';

export const sendAccessEmail = async (toEmail: string, status: 'approved' | 'denied'): Promise<void> => {
  if (!toEmail) return;
  try {
    const templateParams: any = {
      to_email: toEmail,
      from_name: 'Harshala Arakala',
      message: status === 'approved' 
        ? 'You have been granted access to all of my private interview notes.'
        : 'Your request for access to all of my private interview notes has not been granted.'
    };
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
  } catch (error) {
    console.error('Failed to send access email:', error);
  }
};

// Notify owner when someone requests access
const notifyOwnerOfRequest = async (requesterEmail: string): Promise<void> => {
  const ownerEmail = 'harakala.career@gmail.com';
  try {
    const templateParams: any = {
      to_email: ownerEmail,
      from_name: 'Interview Access System',
      message: `A user has requested access to your interview notes.\n\nRequester Email: ${requesterEmail}\n\nPlease review the request in the Interview Experiences admin panel.`
    };
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
  } catch (error) {
    console.error('Failed to notify owner of request:', error);
  }
};

