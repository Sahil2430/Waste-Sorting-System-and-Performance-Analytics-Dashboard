const firebaseConfig = {
    apiKey: "AIzaSyAGYZY_bw7OwrutPQS6wNzSaSPBT2krGkk",
    authDomain: "waste-sorting-system-analytics.firebaseapp.com",
    projectId: "waste-sorting-system-analytics",
    storageBucket: "waste-sorting-system-analytics.appspot.com",
    messagingSenderId: "252843946600",
    appId: "1:252843946600:web:ace48738706bf3515541dd",
    measurementId: "G-9QYM0T13DC"
};

let db;
let auth;

export async function initFirebase(state) {
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log("Firebase initialized. Signing in...");
        await auth.signInAnonymously();
        const user = auth.currentUser;
        console.log("Firebase Auth: Signed in anonymously. User ID:", user.uid);
        setupDataListener(state);
        return true;
    } catch (error) {
        console.warn("Firebase connection failed. Running in Offline Mode.", error.message);
        return false;
    }
}

export async function saveWasteData(item) {
    if (!db || !auth.currentUser) return;
    try {
        const user = auth.currentUser;
        await db.collection("users").doc(user.uid).collection("waste_items").add(item);
    } catch (error) {
        console.error("Error saving data to Firestore:", error);
    }
}

function setupDataListener(appState) {
    if (!db || !auth.currentUser) return;
    const user = auth.currentUser;
    db.collection("users").doc(user.uid).collection("waste_items")
      .orderBy("timestamp", "desc")
      .limit(1000)
      .onSnapshot((snapshot) => {
          console.log("Firebase: Data snapshot received.");
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          appState.allData = items.reverse();
          appState.triggerAnalyticsUpdate();
      }, (error) => {
          console.error("Error with Firestore listener:", error);
      });
}

