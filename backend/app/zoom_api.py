"""
Zoom API Integration Module
Uses Zoom Meeting API to create real meeting links
Requires Server-to-Server OAuth app credentials from Zoom Marketplace
"""

import os
import time
import jwt
import requests
from typing import Optional, Dict
from datetime import datetime, timedelta

class ZoomAPIError(Exception):
    """Custom exception for Zoom API errors"""
    pass

class ZoomAPI:
    """
    Zoom API client for creating meetings
    Uses Server-to-Server OAuth (recommended for server apps)
    """
    
    def __init__(self):
        self.account_id = os.getenv("ZOOM_ACCOUNT_ID")
        self.client_id = os.getenv("ZOOM_CLIENT_ID")
        self.client_secret = os.getenv("ZOOM_CLIENT_SECRET")
        self.base_url = "https://api.zoom.us/v2"
        self._access_token = None
        self._token_expiry = None
        
        if not all([self.account_id, self.client_id, self.client_secret]):
            raise ZoomAPIError(
                "Missing Zoom credentials. Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET"
            )
    
    def _get_access_token(self) -> str:
        """
        Get OAuth access token using Server-to-Server OAuth
        Caches token until expiry
        """
        # Return cached token if still valid
        if self._access_token and self._token_expiry and datetime.now() < self._token_expiry:
            return self._access_token
        
        # Request new token
        token_url = f"https://zoom.us/oauth/token?grant_type=account_credentials&account_id={self.account_id}"
        
        try:
            response = requests.post(
                token_url,
                auth=(self.client_id, self.client_secret),
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            
            data = response.json()
            self._access_token = data["access_token"]
            # Set expiry to 5 minutes before actual expiry for safety
            expires_in = data.get("expires_in", 3600)
            self._token_expiry = datetime.now() + timedelta(seconds=expires_in - 300)
            
            return self._access_token
            
        except requests.exceptions.RequestException as e:
            raise ZoomAPIError(f"Failed to get Zoom access token: {str(e)}")
    
    def create_meeting(
        self,
        topic: str,
        start_time: datetime,
        duration_minutes: int = 60,
        timezone: str = "America/New_York"
    ) -> Dict:
        """
        Create a Zoom meeting
        
        Args:
            topic: Meeting topic/title
            start_time: When the meeting starts
            duration_minutes: Meeting duration in minutes
            timezone: Timezone for the meeting
        
        Returns:
            Dict with meeting details including join_url, meeting_id, password
        """
        access_token = self._get_access_token()
        
        # Format start time in ISO 8601 format
        start_time_str = start_time.strftime("%Y-%m-%dT%H:%M:%S")
        
        meeting_data = {
            "topic": topic,
            "type": 2,  # Scheduled meeting
            "start_time": start_time_str,
            "duration": duration_minutes,
            "timezone": timezone,
            "settings": {
                "host_video": True,
                "participant_video": True,
                "join_before_host": True,
                "mute_upon_entry": False,
                "watermark": False,
                "audio": "both",  # Both telephony and VoIP
                "auto_recording": "none",
                "waiting_room": False,  # Disable for easier access
                "meeting_authentication": False  # Allow anyone with link to join
            }
        }
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        try:
            # Create meeting for the user (using 'me' as the user ID)
            response = requests.post(
                f"{self.base_url}/users/me/meetings",
                json=meeting_data,
                headers=headers
            )
            response.raise_for_status()
            
            meeting = response.json()
            
            return {
                "meeting_id": meeting["id"],
                "join_url": meeting["join_url"],
                "start_url": meeting["start_url"],
                "password": meeting.get("password", ""),
                "topic": meeting["topic"],
                "start_time": meeting["start_time"],
                "duration": meeting["duration"]
            }
            
        except requests.exceptions.RequestException as e:
            raise ZoomAPIError(f"Failed to create Zoom meeting: {str(e)}")
    
    def delete_meeting(self, meeting_id: str) -> bool:
        """
        Delete a Zoom meeting
        
        Args:
            meeting_id: The Zoom meeting ID
        
        Returns:
            True if successful
        """
        access_token = self._get_access_token()
        
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        try:
            response = requests.delete(
                f"{self.base_url}/meetings/{meeting_id}",
                headers=headers
            )
            response.raise_for_status()
            return True
            
        except requests.exceptions.RequestException as e:
            raise ZoomAPIError(f"Failed to delete Zoom meeting: {str(e)}")

# Global instance (lazy initialization)
_zoom_api_instance: Optional[ZoomAPI] = None

def get_zoom_api() -> Optional[ZoomAPI]:
    """
    Get Zoom API instance (singleton pattern)
    Returns None if Zoom credentials are not configured
    """
    global _zoom_api_instance
    
    if _zoom_api_instance is None:
        try:
            _zoom_api_instance = ZoomAPI()
        except ZoomAPIError as e:
            # Return None if credentials not configured (fallback to mock links)
            print(f"Zoom API not configured: {e}")
            return None
    
    return _zoom_api_instance
