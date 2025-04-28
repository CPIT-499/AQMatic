import { User } from "firebase/auth";
import api from "./api"; // Import the configured axios instance

// Function to extract organization name from email domain
export function getOrganizationFromEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const domain = email.split('@')[1];
  if (!domain) return null;
  
  // Extract organization name from domain (e.g., "example" from "example.com")
  const orgName = domain.split('.')[0];
  
  // Capitalize the first letter
  return orgName.charAt(0).toUpperCase() + orgName.slice(1);
}

// Function to check if user belongs to an organization (by email domain)
export function isOrganizationUser(email: string | null | undefined): boolean {
  if (!email) return false;
  const domain = email.split('@')[1];
  if (!domain) return false;
  
  // Here you can implement logic to validate if the domain belongs to a registered organization
  // For simplicity, we'll assume any non-gmail/hotmail/outlook domain is an organization
  const commonPersonalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  return !commonPersonalDomains.includes(domain);
}

// Function to get user display name
export function getUserDisplayName(user: User | null): string {
  if (!user) return "Guest";
  
  // Try to use displayName if it exists
  if (user.displayName) return user.displayName;
  
  // Otherwise use email (without domain) or uid as fallback
  if (user.email) {
    const emailName = user.email.split('@')[0];
    // Capitalize first letter and replace dots/underscores with spaces
    return emailName
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  
  // Last resort is to use part of the UID
  return `User ${user.uid.substring(0, 6)}`;
}

// Function to get user initials for avatars
export function getUserInitials(user: User | null): string {
  if (!user) return "?";
  
  if (user.displayName) {
    // Extract initials from display name (max 2 characters)
    const parts = user.displayName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.displayName[0].toUpperCase();
  }
  
  if (user.email) {
    return user.email[0].toUpperCase();
  }
  
  return "?";
}

// --- New Function: Map Firebase User to Organization via Backend ---
export async function mapUserToOrganization(user: User): Promise<number | null> {
  if (!user?.email) {
    console.error("User email is missing, cannot map to organization.");
    return null;
  }

  try {
    const idToken = await user.getIdToken(true); // Force refresh to get latest claims
    
    // Call the backend endpoint to set/verify the custom claim
    const response = await api.post("/map_user_to_organization", {
      email: user.email,
      id_token: idToken,
    });

    if (response.data.success && response.data.organization_id) {
      console.log(`User ${user.email} mapped to organization ID: ${response.data.organization_id}`);
      // The custom claim is set on the backend, 
      // the frontend will get it next time the token is refreshed.
      return response.data.organization_id;
    } else {
      console.error(`Failed to map user ${user.email} to organization:`, response.data.error);
      return null;
    }
  } catch (error: any) {
    console.error("Error calling map_user_to_organization endpoint:", error.response?.data || error.message);
    return null;
  }
}