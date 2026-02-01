const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Attempt to load service account from environment variable for Netlify
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
    // Fallback for local development or if Firebase CLI handles credentials
    admin.initializeApp();
  }
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  try {
    const planetsRef = db.collection('planets');
    const snapshot = await planetsRef.get();
    const planets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow CORS
      },
      body: JSON.stringify(planets),
    };
  } catch (error) {
    console.error("Error fetching planets:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Failed to fetch planets", details: error.message }),
    };
  }
};
