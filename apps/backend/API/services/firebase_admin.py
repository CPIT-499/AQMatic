import firebase_admin
from firebase_admin import credentials, auth
import os
from typing import Union, Dict
import json

# --- Firebase Admin SDK Initialization ---

def initialize_firebase_admin():
    """Initialize Firebase Admin SDK with better error handling"""
    try:
        # If already initialized, return
        if firebase_admin._apps:
            print("Firebase Admin SDK already initialized.")
            return True

        # Try different paths for the service account key
        current_dir = os.path.dirname(os.path.abspath(__file__))
        possible_paths = [
            os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY_PATH'),  # From environment variable
            os.path.join(current_dir, '..', 'config', 'firebase.json'),  # In config directory
            os.path.join(current_dir, '..', '..', 'serviceAccountKey.json'),  # Backend root
            'serviceAccountKey.json'  # Current directory
        ]

        # Filter out None values
        possible_paths = [p for p in possible_paths if p]

        # Try each path
        for service_account_path in possible_paths:
            if os.path.exists(service_account_path):
                print(f"Found service account key at: {service_account_path}")
                try:
                    # Validate JSON format
                    with open(service_account_path, 'r') as f:
                        service_account_data = json.load(f)
                        
                        # Validate required fields
                        required_fields = [
                            'type', 'project_id', 'private_key_id', 
                            'private_key', 'client_email'
                        ]
                        missing_fields = [
                            field for field in required_fields 
                            if field not in service_account_data
                        ]
                        
                        if missing_fields:
                            print(f"Invalid service account key file: Missing fields {missing_fields}")
                            continue
                    
                    cred = credentials.Certificate(service_account_path)
                    firebase_admin.initialize_app(cred)
                    print("Firebase Admin SDK initialized successfully.")
                    return True
                except json.JSONDecodeError as e:
                    print(f"Invalid JSON format in service account key file: {service_account_path}")
                    print(f"Error: {str(e)}")
                    continue
                except Exception as e:
                    print(f"Failed to initialize with {service_account_path}")
                    print(f"Error: {str(e)}")
                    continue

        # If we get here, no valid path was found
        paths_tried = "\n".join(f"- {p}" for p in possible_paths)
        print(f"Error: Could not find valid service account key file. Tried:\n{paths_tried}")
        return False

    except Exception as e:
        print(f"Unexpected error during Firebase Admin SDK initialization: {str(e)}")
        return False

# Initialize Firebase Admin SDK
firebase_initialized = initialize_firebase_admin()

if not firebase_initialized:
    print("""
Firebase Admin SDK initialization failed!
Please ensure you have:
1. Generated a service account key from Firebase Console
2. Saved it as 'firebase.json' in the apps/backend/API/config directory
3. Or set FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable
""")

# --- Custom Claims Function ---

def set_organization_claim(user_uid: str, organization_id: int, organization_name: Union[str, None] = None) -> bool:
    """
    Sets the organization_id and optionally organization_name as custom claims 
    for a given user UID. Returns True on success, False on failure.
    """
    if not firebase_initialized:
        print("Error: Firebase Admin SDK not initialized. Cannot set claims.")
        return False
        
    try:
        # Get current custom claims
        current_claims = auth.get_user(user_uid).custom_claims or {}
        
        # Update claims
        new_claims = {
            **current_claims,  # Preserve existing claims
            'organization_id': organization_id
        }
        
        if organization_name:
            new_claims['organization_name'] = organization_name
            
        # Set custom user claims
        auth.set_custom_user_claims(user_uid, new_claims)
        
        print(f"Successfully set custom claims for user {user_uid}: {new_claims}")
        return True

    except auth.UserNotFoundError:
        print(f"Error setting claims: User with UID {user_uid} not found.")
        return False
    except Exception as e:
        print(f"An unexpected error occurred while setting custom claims for user {user_uid}: {e}")
        return False

def verify_firebase_token(id_token: str) -> Union[Dict[str, any], None]:
    """
    Verifies the Firebase ID token and returns the decoded claims.
    Returns None if verification fails.
    """
    if not firebase_initialized:
        print("Error: Firebase Admin SDK not initialized. Cannot verify token.")
        return None
        
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Error verifying Firebase ID token: {e}")
        return None

# --- Other Firebase Admin related functions can go here ---
