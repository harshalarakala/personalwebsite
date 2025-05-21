# Firebase Setup for Personal Website

## Overview

This guide will help you set up Firebase for your personal website, allowing you to:
- Authenticate with Google
- Store and manage experiences and projects in Firestore
- Archive and restore content
- All without redeploying your website

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name your project (e.g., "personal-website")
4. Follow the setup instructions (you can disable Google Analytics if you prefer)
5. Click "Create project"

## Step 2: Set Up Firebase Authentication

1. In the Firebase Console, navigate to your project
2. In the sidebar, click "Authentication"
3. Click "Get started"
4. Click the "Google" provider
5. Enable it and fill in your email
6. Save the changes

## Step 3: Set Up Firestore Database

1. In the Firebase Console, navigate to your project
2. In the sidebar, click "Firestore Database"
3. Click "Create database"
4. Start in test mode (we'll add security rules later)
5. Choose a location close to your target audience
6. Click "Enable"

## Step 4: Set Up Web App

1. In the Firebase Console, navigate to your project
2. Click the web icon (</>) to add a web app
3. Register your app with a nickname (e.g., "personal-website-web")
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 5: Update Your Project

1. Open `src/client/services/firebaseConfig.ts`
2. Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

3. Update the authorized email in `src/client/services/authService.ts`:

```typescript
const AUTHORIZED_EMAILS = ["your.email@example.com"];
```

## Step 6: Add Security Rules to Firestore

1. In the Firebase Console, navigate to your project
2. Click "Firestore Database"
3. Click the "Rules" tab
4. Replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to non-archived experiences and projects
    match /experiences/{experienceId} {
      allow read: if !resource.data.archived;
      allow read, write: if request.auth != null && request.auth.token.email == 'your.email@example.com';
    }
    
    match /projects/{projectId} {
      allow read: if !resource.data.archived;
      allow read, write: if request.auth != null && request.auth.token.email == 'your.email@example.com';
    }
  }
}
```

5. Replace `your.email@example.com` with your authorized email
6. Click "Publish"

## Step 7: Deploy Your Website

1. Build your website:
```
npm run build
```

2. Deploy to your hosting provider

## Using Your New Admin Panel

Once deployed, you can:
1. Visit your website
2. Click the "Login" button in the top right of the experiences section
3. Log in with your Google account
4. You'll now have access to:
   - Add new experiences and projects
   - Edit existing content 
   - Archive items (they'll be hidden from public view)
   - Delete items
   - View archived items by clicking "Show Archived"

## Troubleshooting

If you encounter issues:

1. Make sure your Firebase config is correct
2. Check that the authorized email matches your Google account email
3. Ensure you've enabled the Google Authentication provider
4. Check Firebase console logs for any errors
5. Make sure your Firestore rules are published correctly 