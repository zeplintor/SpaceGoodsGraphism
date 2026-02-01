const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY for create-planet:", e);
    admin.initializeApp();
  }
}

const db = admin.firestore();
const MAX_PLANETS = 100;

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const planetsRef = db.collection('planets');
    const snapshot = await planetsRef.get();
    
    if (snapshot.size >= MAX_PLANETS) {
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: `Planet creation limit reached. Maximum ${MAX_PLANETS} planets allowed.` }),
      };
    }

    const data = JSON.parse(event.body);

    const newPlanet = {
      name: data.name || 'Mystery Planet',
      link: data.link || '',
      avatar: data.avatar || '',
      x: data.x || 0,
      y: data.y || 0,
      size: data.size || 70,
      depth: data.depth || 'near',
      claimedBy: null,
      claimedAt: null,
      claimExpiresAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await planetsRef.add(newPlanet);
    const createdPlanet = { id: docRef.id, ...newPlanet };

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(createdPlanet),
    };
  } catch (error) {
    console.error("Error creating planet:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Failed to create planet", details: error.message }),
    };
  }
};
