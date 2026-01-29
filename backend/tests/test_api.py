"""
Backend API Tests for Blackjack Trainer
Tests auth endpoints and sync endpoints
"""
import pytest
import requests
import os
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndStatus:
    """Health check and status endpoint tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Blackjack Trainer API"
    
    def test_status_post(self):
        """Test status POST endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/status",
            json={"client_name": "test_client"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["client_name"] == "test_client"
    
    def test_status_get(self):
        """Test status GET endpoint"""
        response = requests.get(f"{BASE_URL}/api/status")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestAuthEndpoints:
    """Authentication endpoint tests - unauthenticated access"""
    
    def test_auth_me_unauthenticated(self):
        """Test /api/auth/me returns 401 for unauthenticated users"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Not authenticated"
    
    def test_auth_me_with_invalid_token(self):
        """Test /api/auth/me returns 401 with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_12345"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
    
    def test_auth_session_missing_session_id(self):
        """Test /api/auth/session returns 400 without session_id"""
        response = requests.post(
            f"{BASE_URL}/api/auth/session",
            json={}
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "session_id" in data["detail"].lower()
    
    def test_auth_logout_without_session(self):
        """Test /api/auth/logout works without session"""
        response = requests.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data


class TestSyncEndpointsUnauthenticated:
    """Sync endpoint tests - unauthenticated access should return 401"""
    
    def test_sync_stats_get_unauthenticated(self):
        """Test /api/sync/stats GET returns 401 for unauthenticated users"""
        response = requests.get(f"{BASE_URL}/api/sync/stats")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Not authenticated"
    
    def test_sync_stats_post_unauthenticated(self):
        """Test /api/sync/stats POST returns 401 for unauthenticated users"""
        response = requests.post(
            f"{BASE_URL}/api/sync/stats",
            json={"game_stats": {"handsPlayed": 10}}
        )
        assert response.status_code == 401
    
    def test_sync_history_get_unauthenticated(self):
        """Test /api/sync/history GET returns 401 for unauthenticated users"""
        response = requests.get(f"{BASE_URL}/api/sync/history")
        assert response.status_code == 401
    
    def test_sync_history_post_unauthenticated(self):
        """Test /api/sync/history POST returns 401 for unauthenticated users"""
        response = requests.post(
            f"{BASE_URL}/api/sync/history",
            json={"hands": [{"timestamp": 123456}]}
        )
        assert response.status_code == 401
    
    def test_sync_settings_get_unauthenticated(self):
        """Test /api/sync/settings GET returns 401 for unauthenticated users"""
        response = requests.get(f"{BASE_URL}/api/sync/settings")
        assert response.status_code == 401
    
    def test_sync_settings_post_unauthenticated(self):
        """Test /api/sync/settings POST returns 401 for unauthenticated users"""
        response = requests.post(
            f"{BASE_URL}/api/sync/settings",
            json={"settings": {"numDecks": 6}}
        )
        assert response.status_code == 401
    
    def test_sync_full_unauthenticated(self):
        """Test /api/sync/full POST returns 401 for unauthenticated users"""
        response = requests.post(
            f"{BASE_URL}/api/sync/full",
            json={
                "game_stats": {},
                "strategy_stats": {},
                "training_stats": {},
                "hands": [],
                "settings": {}
            }
        )
        assert response.status_code == 401


class TestAuthenticatedEndpoints:
    """Tests for authenticated endpoints using test session"""
    
    @pytest.fixture(autouse=True)
    def setup_test_user(self):
        """Create test user and session in MongoDB"""
        import subprocess
        import time
        
        timestamp = int(time.time() * 1000)
        self.user_id = f"test-user-{timestamp}"
        self.session_token = f"test_session_{timestamp}"
        
        # Create test user and session
        mongo_script = f"""
        use('test_database');
        db.users.insertOne({{
          user_id: '{self.user_id}',
          email: 'test.user.{timestamp}@example.com',
          name: 'Test User',
          picture: 'https://via.placeholder.com/150',
          created_at: new Date().toISOString(),
          last_sync: null,
          settings: {{}}
        }});
        db.user_sessions.insertOne({{
          user_id: '{self.user_id}',
          session_token: '{self.session_token}',
          expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
          created_at: new Date().toISOString()
        }});
        """
        subprocess.run(['mongosh', '--quiet', '--eval', mongo_script], capture_output=True)
        
        yield
        
        # Cleanup
        cleanup_script = f"""
        use('test_database');
        db.users.deleteOne({{ user_id: '{self.user_id}' }});
        db.user_sessions.deleteOne({{ session_token: '{self.session_token}' }});
        db.stats.deleteOne({{ user_id: '{self.user_id}' }});
        db.history.deleteOne({{ user_id: '{self.user_id}' }});
        """
        subprocess.run(['mongosh', '--quiet', '--eval', cleanup_script], capture_output=True)
    
    def test_auth_me_authenticated(self):
        """Test /api/auth/me returns user data for authenticated users"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {self.session_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == self.user_id
        assert "email" in data
        assert "name" in data
    
    def test_sync_stats_get_authenticated(self):
        """Test /api/sync/stats GET returns stats for authenticated users"""
        response = requests.get(
            f"{BASE_URL}/api/sync/stats",
            headers={"Authorization": f"Bearer {self.session_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == self.user_id
        assert "game_stats" in data
        assert "strategy_stats" in data
        assert "training_stats" in data
    
    def test_sync_stats_post_authenticated(self):
        """Test /api/sync/stats POST updates stats for authenticated users"""
        test_stats = {
            "game_stats": {"handsPlayed": 20, "handsWon": 10},
            "strategy_stats": {"totalDecisions": 15, "correctDecisions": 12}
        }
        response = requests.post(
            f"{BASE_URL}/api/sync/stats",
            headers={
                "Authorization": f"Bearer {self.session_token}",
                "Content-Type": "application/json"
            },
            json=test_stats
        )
        assert response.status_code == 200
        data = response.json()
        assert data["game_stats"]["handsPlayed"] == 20
        assert data["game_stats"]["handsWon"] == 10
        
        # Verify persistence with GET
        get_response = requests.get(
            f"{BASE_URL}/api/sync/stats",
            headers={"Authorization": f"Bearer {self.session_token}"}
        )
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["game_stats"]["handsPlayed"] == 20
    
    def test_sync_settings_authenticated(self):
        """Test /api/sync/settings GET and POST for authenticated users"""
        # POST settings
        test_settings = {"numDecks": 8, "minBet": 25}
        post_response = requests.post(
            f"{BASE_URL}/api/sync/settings",
            headers={
                "Authorization": f"Bearer {self.session_token}",
                "Content-Type": "application/json"
            },
            json={"settings": test_settings}
        )
        assert post_response.status_code == 200
        
        # GET settings
        get_response = requests.get(
            f"{BASE_URL}/api/sync/settings",
            headers={"Authorization": f"Bearer {self.session_token}"}
        )
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["settings"]["numDecks"] == 8
        assert data["settings"]["minBet"] == 25
    
    def test_sync_full_authenticated(self):
        """Test /api/sync/full POST for authenticated users"""
        sync_data = {
            "game_stats": {"handsPlayed": 50},
            "strategy_stats": {"totalDecisions": 40},
            "training_stats": {"totalAttempts": 30},
            "hands": [{"timestamp": 123456789, "result": "win"}],
            "settings": {"numDecks": 6}
        }
        response = requests.post(
            f"{BASE_URL}/api/sync/full",
            headers={
                "Authorization": f"Bearer {self.session_token}",
                "Content-Type": "application/json"
            },
            json=sync_data
        )
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        assert "history" in data
        assert "settings" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
