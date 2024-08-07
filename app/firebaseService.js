import { auth } from "./firebase/config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase/config"; // Import db from firebase/config

// User sign-up
export const signUpUser = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    // Store user details in Firestore
    await setDoc(doc(db, "users", res.user.uid), {
      username,
      email
    });
    sessionStorage.setItem('user', JSON.stringify({ username, email, userId: res.user.uid }));
    return res;
  } catch (error) {
    throw error;
  }
};

// User sign-in with email or username
export const signInUser = async (identifier, password) => {
  try {
    let user;
    const usersRef = collection(db, "users");
    if (identifier.includes("@")) {
      user = await signInWithEmailAndPassword(auth, identifier, password);
    } else {
      // Query Firestore for user by username
      const q = query(usersRef, where("username", "==", identifier));
      const userSnap = await getDocs(q);
      if (userSnap.empty) {
        throw new Error("User not found");
      }
      const userDoc = userSnap.docs[0].data();
      user = await signInWithEmailAndPassword(auth, userDoc.email, password);
    }
    sessionStorage.setItem('user', JSON.stringify({ username: identifier, email: user.user.email, userId: user.user.uid }));
    return { username: identifier, email: user.user.email, userId: user.user.uid };
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};
