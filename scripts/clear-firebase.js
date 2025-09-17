const admin = require("firebase-admin");

// Configuración similar a la del servidor
const serviceAccount = {
  type: "service_account",
  project_id: "capogol-79914",
  private_key_id: "ea89215da0864b56d5895bf92fcda40a2254ea30",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCnmQYMx1AQNfQ7\nW/hWiu/pNLQr5pkhD06zKZ0cLJuCa448A6J2a/xYMnBzyYkGK9qakGyDMblL4u12\nKjFWPaxNLVhKCjBl3mjytKiYEnju5b5J/1XE3mCNwCABLJdf2UDIifJIF5utP/mm\nSYGU1xC1RfPdZSkbxbk6RaWpyhLwXTmoajnYe0A1M0cQunYoIKdg6fUuvR2FWl6t\nM0LT6+goGQIJH+MOvP9OkmEVXKSNSUHiN4W5VU3FW8ToU73K4H8PeU0rMXqo1Xx5\nnPkhVJwNCaainJfpSotd9Fcm9jT8sqrxLFzyhdil70LBId5SJ3LeMLQG8OnkADdq\n7o5H8zypAgMBAAECggEAPlD3nui9LEnjde7Md+FRMzUViP1FErXOXW+rqz4q1GOJ\nj2cKkV21hlW62lKlUFYeAjqRHnbunvjRso4dqiNkXY3uthjzxezcuOHTjjfQH4Pt\nLTZzfa/x1sMJI2ahIlJ1dBtWqtecWt7exKWwONd+ruhDtJ5Ymqr6JGChKHCqehSV\nwTR9YeYDYd4AcP/o2qBnUjwsA6+uhmNUUnC7XWQ4QR/hnFW/QRv1RBOYYJplvOPP\nL0BnO8rsOD2YgURhibatqpRAMNwapqhtn6iWVRZdDqX9HrLB9Sx6zxWxm2EvVpVO\nPmYRFAh3AVhpQcFG1+qiojn0zJIqEygAkmLq62LQwQKBgQDQt1vky689CTeUhdXM\ngmbNouoRl1/3+4gu2PX4a7IMEi/ggRNOPA3AvnnUr/LIWMpoeAKOtVnKJrbRtNkY\nkK4EnneZfi0BG73tsHi8Uqw3hyK4EHLBG9jtakNhJ1RYM7vS/pd0516DJC+A35Fz\npfsZVeHsUWmSeyq19bN9rG+RowKBgQDNkPgoxn/7BU7gnAjdz/y6yTmP4mB8NWu1\nOzmdoYyAFag4Q2Qzw3BP4C5v8egyW7pk5Za5iOsgE94XsDvrLCjR1awIAMPOvk9R\nhCjhjyedHdKjN7uQy0ZrEUUKU3rAzPMYSXBEuQab1UuqEt8pBWnCdAE3lobveXP5\niFsyv1dVQwKBgQCCXbUpUMxRPHuZ6oqjZeQel57KhBmuhE8Iq/3fQC2C+q0q9pR/\nbmVMuezRG2FzIHq1DBjU2JOP/+R7UhG0FVKMkgq0NiqYIaLdXzfasWzedisKe0Oi\nOOmjSZdyjKVTPmUYImup2oafNS/yuDJa4RbZOVqXSDbABuyjoSeO3PEHLwKBgQCS\nYLeE+YwqaCY5pIJfyHnTW/SEM5O2/qc6vviQ+Xc9wa4umjZg8bso9Z67kgtgyJaa\nwC2q4gdjqSINxi10kdZjTP6aGElWD4gVqMEflLuFkrXqCYajXUxAc2SxLK6NWaOE\n2M578TD2iFS/v35vDG65y7cOKT7eiaJ+vo0KPtvmVwKBgA2bhWj9dKuU0HhitBye\npmNlmX0ycTa9vuMl6IjmXBWNzn1jDoaXEZWhWczeyF6t/20PoMX2PUS3xlbV1GWD\nY4J9EQ1R2UMjFk753NcJFAJGUsr9BpGy+2lvb3gG5Lwbfij8uF+dLN4Prlnyti69\n4EJq5jKF8yBbFooZEEZuC+GI\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@capogol-79914.iam.gserviceaccount.com",
  client_id: "100721939544866621941",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40capogol-79914.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

async function clearFirebase() {
  try {
    console.log("🔥 Initializing Firebase Admin...");

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "capogol-79914",
      });
    }

    const db = admin.firestore();
    console.log("🗄️ Connected to Firestore");

    // Eliminar todas las colecciones relacionadas con fixtures
    const collections = [
      "fixtures",
      "synced_data",
      "match_stats",
      "match_events",
      "lineups",
    ];

    for (const collectionName of collections) {
      console.log(`🧹 Clearing collection: ${collectionName}`);

      try {
        const snapshot = await db.collection(collectionName).get();

        if (snapshot.empty) {
          console.log(`✅ Collection ${collectionName} is already empty`);
          continue;
        }

        console.log(`📄 Found ${snapshot.size} documents in ${collectionName}`);

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(
          `✅ Cleared ${snapshot.size} documents from ${collectionName}`
        );
      } catch (error) {
        console.log(
          `⚪ Collection ${collectionName} doesn't exist or is empty`
        );
      }
    }

    // También limpiar documentos que empiecen con "fixtures_"
    console.log("🧹 Clearing fixture-specific documents...");
    try {
      const snapshot = await db.collectionGroup("cache").get();
      const fixtureDocs = snapshot.docs.filter(doc =>
        doc.id.startsWith("fixtures_")
      );

      if (fixtureDocs.length > 0) {
        const batch = db.batch();
        fixtureDocs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`✅ Cleared ${fixtureDocs.length} fixture documents`);
      }
    } catch (error) {
      console.log("⚪ No fixture documents to clear");
    }

    console.log("✨ Firebase cleared successfully!");
    console.log("🚀 Ready for fresh data loading tests");
  } catch (error) {
    console.error("❌ Error clearing Firebase:", error);
  }

  process.exit(0);
}

clearFirebase();
