import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as firebaseSignOut,
  sendEmailVerification,
  UserCredential,
  User
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

// Sign up with email and password
export async function signUp(
  email: string, 
  password: string, 
  displayName: string
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Update the user's profile with displayName
  await updateProfile(user, { displayName });
  
  // Send email verification
  await sendEmailVerification(user);
  
  return user;
}

// Sign out
export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

// Reset password
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!auth.currentUser;
}

// Store user in session/local storage based on remember me flag
export function storeUserInStorage(user: User, rememberMe: boolean): void {
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
  
  if (rememberMe) {
    localStorage.setItem("authUser", JSON.stringify(userData));
  } else {
    sessionStorage.setItem("authUser", JSON.stringify(userData));
  }
}

// Clear user from storage
export function clearUserFromStorage(): void {
  localStorage.removeItem("authUser");
  sessionStorage.removeItem("authUser");
} 