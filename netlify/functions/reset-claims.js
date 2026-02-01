const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY for reset-claims:", e);
    admin.initializeApp();
  }
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  // This function should ideally be protected or triggered by a trusted source (e.g., Netlify Scheduled Function)
  // For simplicity and demonstration, it's open, but in production, add authentication or token check.

  try {
    const planetsRef = db.collection('planets');
    const now = admin.firestore.Timestamp.now();
    let resetCount = 0;

    // Query for planets where claimExpiresAt is in the past and claimedBy is not null
    const snapshot = await planetsRef
      .where('claimedBy', '!=', null)
      .where('claimExpiresAt', '<', now)
      .get();

    if (snapshot.empty) {
      console.log('No expired claims to reset.');
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "No expired claims to reset." }),
      };
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        claimedBy: null,
        claimedAt: null,
        claimExpiresAt: null,
      });
      resetCount++;
    });

    await batch.commit();

    console.log(`Reset ${resetCount} expired claims.`);
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: `Reset ${resetCount} expired claims.`, resetCount }),
    };
  } catch (error) {
    console.error("Error resetting claims:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to reset claims", details: error.message }),
    };
  }
};