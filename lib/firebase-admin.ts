import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// Helper function to dynamically initialize Firebase Admin in Next.js Server environments
export function getFirebaseAdmin() {
  if (!getApps().length) {
    try {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : null;

      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
        });
      } else {
        // Fallback or explicit Project ID
        admin.initializeApp({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || "lawbridge-ethiopia",
        });
      }
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
    }
  }

  return admin;
}

export const getFirestoreDb = () => {
  return getFirebaseAdmin().firestore();
};
