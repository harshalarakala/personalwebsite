/// <reference types="react-scripts" />

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '@react-oauth/google';
declare module 'emailjs-com';
declare module 'react-toastify';
declare module 'react-modal';
declare module '@uiw/react-md-editor';
declare module 'react-datepicker';
declare module 'framer-motion';
declare module 'react-icons/fa';
declare module 'react-icons/si';
declare module 'react-icons/di';
declare module 'react-dom/client';
declare module 'pkce-challenge';

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    [key: string]: any;
  }
  export function signInWithPopup(auth: any, provider: any): Promise<{ user: User }>;
  export function onAuthStateChanged(auth: any, callback: (user: User | null) => void): () => void;
  export function signOut(auth: any): Promise<void>;
  export function getAuth(app?: any): any;
  export class GoogleAuthProvider {}
}

declare module 'firebase/firestore' {
  export class Timestamp {
    seconds: number;
    nanoseconds: number;
    toDate(): Date;
    toMillis(): number;
    static now(): Timestamp;
    static fromDate(date: Date): Timestamp;
    static fromMillis(milliseconds: number): Timestamp;
  }
  export function collection(db: any, path: string): any;
  export function doc(collection: any, id: string): any;
  export function getDocs(query: any): Promise<any>;
  export function addDoc(collection: any, data: any): Promise<any>;
  export function updateDoc(docRef: any, data: any): Promise<void>;
  export function deleteDoc(docRef: any): Promise<void>;
  export function query(collection: any, ...constraints: any[]): any;
  export function where(field: string, op: string, value: any): any;
  export function getFirestore(app?: any, databaseId?: string): any;
}

declare module 'firebase/app' {
  export function initializeApp(config: any): any;
}

declare module 'web-vitals' {
  export interface ReportHandler {
    (metric: any): void;
  }
  export function getCLS(onPerfEntry: ReportHandler): void;
  export function getFID(onPerfEntry: ReportHandler): void;
  export function getFCP(onPerfEntry: ReportHandler): void;
  export function getLCP(onPerfEntry: ReportHandler): void;
  export function getTTFB(onPerfEntry: ReportHandler): void;
}
