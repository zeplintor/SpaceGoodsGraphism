const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY for claim-planet:", e);
    admin.initializeApp();
  }
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const { id: planetId } = event.pathParameters; // Get planet ID from URL path
  const { claimerId } = JSON.parse(event.body); // Get claimer ID from request body

  if (!planetId || !claimerId) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Planet ID and claimer ID are required." }),
    };
  }

  const planetRef = db.collection('planets').doc(planetId);

  try {
    const transactionResult = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(planetRef);

      if (!doc.exists) {
        throw new Error("Planet not found.");
      }

      const planet = doc.data();
      const now = admin.firestore.Timestamp.now();

      // Check if already claimed and not expired
      if (planet.claimedBy && planet.claimExpiresAt && planet.claimExpiresAt.toDate() > now.toDate()) {
        if (planet.claimedBy === claimerId) {
            // Already claimed by this user, allow re-claim to update expiration
            // Or simply return the current state
            return {
                message: "Planet already claimed by you.",
                planet: { id: doc.id, ...planet }
            };
        } else {
            throw new Error("Planet is already claimed by another user.");
        }
      }

      // Claim the planet
      const claimDurationMonths = 1;
      const claimExpiresAt = new Date();
      claimExpiresAt.setMonth(claimExpiresAt.getMonth() + claimDurationMonths);

      transaction.update(planetRef, {
        claimedBy: claimerId,
        claimedAt: now,
        claimExpiresAt: admin.firestore.Timestamp.fromDate(claimExpiresAt),
      });

      const updatedPlanet = {
        id: doc.id,
        ...planet,
        claimedBy: claimerId,
        claimedAt: now,
        claimExpiresAt: admin.firestore.Timestamp.fromDate(claimExpiresAt),
      };

      return {
        message: "Planet claimed successfully.",
        planet: updatedPlanet,
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(transactionResult.planet),
    };

  } catch (error) {
    console.error("Error claiming planet:", error);
    return {
      statusCode: 400, // Use 400 for client-side errors like already claimed
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: error.message || "Failed to claim planet" }),
    };
  }
};
