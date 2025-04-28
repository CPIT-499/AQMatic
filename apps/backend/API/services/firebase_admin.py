import firebase_admin
from firebase_admin import credentials, auth
import os
from fastapi import HTTPException, status

# Construct the path to the credentials file relative to this script's location
# Go up two levels from services/ to API/, then into config/
creds_path = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), # Up to API/
    'config',
    'aqmatic-e5022-firebase-adminsdk-fbsvc-7ad9d035dd.json'
)

try:
    # Check if the app is already initialized to prevent errors during hot-reloading
    if not firebase_admin._apps:
        cred = credentials.Certificate(creds_path)
        firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")
except FileNotFoundError:
    print(f"Error: Firebase credentials file not found at {creds_path}")
    # Depending on your setup, you might want to raise an exception or exit
    # raise RuntimeError("Firebase credentials file not found.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    # raise RuntimeError(f"Firebase Admin SDK initialization failed: {e}")

def verify_firebase_token(id_token: str) -> dict:
    """
    Verifies the Firebase ID token using the Admin SDK.
    Returns the decoded token payload if valid.
    Raises HTTPException if invalid or expired.
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase ID token has expired",
            headers={"WWW-Authenticate": "Bearer error=\"invalid_token\", error_description=\"Token expired\""},
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token",
            headers={"WWW-Authenticate": "Bearer error=\"invalid_token\""},
        )
    except Exception as e:
        # Catch any other potential errors during verification
        print(f"Error verifying Firebase token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying Firebase token: {str(e)}"
        )


def set_organization_claim(email: str, organization_id: int) -> bool:
    """
    Sets a custom claim 'organization_id' for a user identified by email.
    Returns True if successful, False otherwise.
    """
    try:
        user = auth.get_user_by_email(email)
        # Set the custom claim. This merges with existing claims.
        auth.set_custom_user_claims(user.uid, {'organization_id': organization_id})
        print(f"Successfully set organization_id={organization_id} for user {email} (UID: {user.uid})")
        return True
    except auth.UserNotFoundError:
        print(f"Error: User with email {email} not found in Firebase.")
        return False
    except Exception as e:
        print(f"Error setting custom claim for {email}: {e}")
        return False

# Example usage (optional, for testing)
# async def get_user_claims(email: str):
#     try:
#         user = auth.get_user_by_email(email)
#         return user.custom_claims
#     except Exception as e:
#         print(f"Error getting claims for {email}: {e}")
#         return None

