import requests
import sys
from datetime import datetime

class BlackjackAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text[:200]}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text[:200]}")

            return success, response.json() if response.status_code < 400 else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root(self):
        """Test root endpoint"""
        success, response = self.run_test(
            "Root Endpoint",
            "GET",
            "/",
            200
        )
        return success

    def test_register(self, email, password):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "/api/auth/register",
            200,
            data={"email": email, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "/api/auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "/api/me",
            200
        )
        if success:
            print(f"   User: {response.get('email')}")
            print(f"   Bankroll: ${response.get('bankroll')}")
            print(f"   Settings: {response.get('settings')}")
        return success

    def test_update_settings(self):
        """Test update user settings"""
        settings = {
            "decks": 6,
            "s17": True,
            "das": True,
            "difficulty": "hard"
        }
        success, response = self.run_test(
            "Update Settings",
            "PUT",
            "/api/settings",
            200,
            data=settings
        )
        return success

    def test_save_session(self):
        """Test save game session"""
        session_data = {
            "bankroll_end": 9950,
            "hands_played": 5,
            "mistakes": 1
        }
        success, response = self.run_test(
            "Save Session",
            "POST",
            "/api/sessions/save",
            200,
            data=session_data
        )
        return success

def main():
    print("=" * 60)
    print("🃏 Blackjack Trainer API Test Suite")
    print("=" * 60)
    
    # Setup
    tester = BlackjackAPITester("http://localhost:8001")
    test_email = f"user3@test.com"
    test_password = "password123"

    # Run tests
    print("\n📋 Test Plan:")
    print("1. Test root endpoint")
    print("2. Register new user (user3@test.com)")
    print("3. Get user details")
    print("4. Update settings")
    print("5. Save session")
    print("6. Test login with existing user")
    
    # Test 1: Root
    tester.test_root()

    # Test 2: Register
    if not tester.test_register(test_email, test_password):
        print("\n⚠️  Registration failed - trying login instead")
        if not tester.test_login(test_email, test_password):
            print("❌ Both registration and login failed, stopping tests")
            return 1

    # Test 3: Get Me
    tester.test_get_me()

    # Test 4: Update Settings
    tester.test_update_settings()

    # Test 5: Save Session
    tester.test_save_session()

    # Test 6: Login (if registration worked, this should work with same credentials)
    # Clear token first
    tester.token = None
    tester.test_login(test_email, test_password)

    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    print("=" * 60)
    
    if tester.tests_passed == tester.tests_run:
        print("✅ All tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
