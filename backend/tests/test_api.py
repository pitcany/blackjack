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


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
