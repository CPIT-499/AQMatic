import subprocess
import os
import sys

# Add the src directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

def run_api_tests(**kwargs):
    """
    Function to run API unit tests and return the results
    Returns success status as boolean
    
    This function executes the API tests using Docker to run the test suite
    inside the backend-fastapi-1 container.
    """
    try:
        # Using subprocess to run the tests using docker exec
        result = subprocess.run(
            ["docker", "exec", "-i", "backend-fastapi-1", "python", "-m", "unittest", "API.test_api"],
            capture_output=True,
            text=True,
            check=False  # Don't raise exception on test failure
        )
        
        # Log the test output
        print("API Test Output:")
        print(result.stdout)
        
        if result.stderr:
            print("API Test Errors:")
            print(result.stderr)
        
        # Return True if tests succeeded (exit code 0), False otherwise
        return result.returncode == 0
    except Exception as e:
        print(f"Error running API tests: {str(e)}")
        return False
