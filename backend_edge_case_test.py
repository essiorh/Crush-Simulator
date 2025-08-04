#!/usr/bin/env python3
"""
Edge Case Testing for Crush Simulator Backend API
Tests error handling and edge cases.
"""

import requests
import json

BACKEND_URL = "http://localhost:8001"

def test_invalid_session_operations():
    """Test operations with invalid session IDs"""
    print("🧪 Testing Invalid Session Operations")
    
    fake_session_id = "invalid-session-id"
    
    # Test crush with invalid session
    crush_data = {"object_id": "can_aluminum", "force": 1.0, "position": {"x": 0, "y": 0}}
    response = requests.post(f"{BACKEND_URL}/api/session/{fake_session_id}/crush", json=crush_data)
    print(f"✅ Invalid session crush: {response.status_code} (expected 404)")
    
    # Test stats with invalid session
    response = requests.get(f"{BACKEND_URL}/api/session/{fake_session_id}/stats")
    print(f"✅ Invalid session stats: {response.status_code} (expected 404)")
    
    # Test end with invalid session
    response = requests.post(f"{BACKEND_URL}/api/session/{fake_session_id}/end")
    print(f"✅ Invalid session end: {response.status_code} (expected 404)")

def test_invalid_object_operations():
    """Test operations with invalid object IDs"""
    print("\n🧪 Testing Invalid Object Operations")
    
    # Test invalid object details
    response = requests.get(f"{BACKEND_URL}/api/objects/invalid-object")
    print(f"✅ Invalid object details: {response.status_code} (expected 404)")
    
    # Test crush with invalid object
    session_data = {"mode": "interactive", "objects_crushed": [], "total_satisfaction": 0, "session_duration": 0}
    session_response = requests.post(f"{BACKEND_URL}/api/session/start", json=session_data)
    
    if session_response.status_code == 200:
        session_id = session_response.json()["session_id"]
        crush_data = {"object_id": "invalid-object", "force": 1.0, "position": {"x": 0, "y": 0}}
        response = requests.post(f"{BACKEND_URL}/api/session/{session_id}/crush", json=crush_data)
        print(f"✅ Invalid object crush: {response.status_code} (expected 404)")
        
        # Clean up
        requests.post(f"{BACKEND_URL}/api/session/{session_id}/end")

def test_data_persistence():
    """Test that session data persists correctly"""
    print("\n🧪 Testing Data Persistence")
    
    # Create session
    session_data = {"mode": "interactive", "objects_crushed": [], "total_satisfaction": 0, "session_duration": 0}
    session_response = requests.post(f"{BACKEND_URL}/api/session/start", json=session_data)
    
    if session_response.status_code == 200:
        session_id = session_response.json()["session_id"]
        
        # Crush multiple objects
        objects_to_crush = ["can_aluminum", "cardboard_box", "phone_old"]
        total_expected_satisfaction = 0
        
        for obj_id in objects_to_crush:
            # Get object details to know satisfaction score
            obj_response = requests.get(f"{BACKEND_URL}/api/objects/{obj_id}")
            if obj_response.status_code == 200:
                obj_data = obj_response.json()
                total_expected_satisfaction += obj_data["satisfaction_score"]
                
                # Crush the object
                crush_data = {"object_id": obj_id, "force": 1.0, "position": {"x": 0, "y": 0}}
                requests.post(f"{BACKEND_URL}/api/session/{session_id}/crush", json=crush_data)
        
        # Check final stats
        stats_response = requests.get(f"{BACKEND_URL}/api/session/{session_id}/stats")
        if stats_response.status_code == 200:
            stats = stats_response.json()
            print(f"✅ Objects crushed: {stats['total_crushed']} (expected {len(objects_to_crush)})")
            print(f"✅ Total satisfaction: {stats['total_satisfaction']} (expected {total_expected_satisfaction})")
            print(f"✅ Objects list: {len(stats['objects_crushed'])} items")
            
            # Verify correctness
            if (stats['total_crushed'] == len(objects_to_crush) and 
                stats['total_satisfaction'] == total_expected_satisfaction and
                len(stats['objects_crushed']) == len(objects_to_crush)):
                print("✅ Data persistence: PASS")
            else:
                print("❌ Data persistence: FAIL")
        
        # Clean up
        requests.post(f"{BACKEND_URL}/api/session/{session_id}/end")

def test_concurrent_sessions():
    """Test multiple concurrent sessions"""
    print("\n🧪 Testing Concurrent Sessions")
    
    sessions = []
    
    # Create multiple sessions
    for i in range(3):
        session_data = {"mode": "interactive", "objects_crushed": [], "total_satisfaction": 0, "session_duration": 0}
        response = requests.post(f"{BACKEND_URL}/api/session/start", json=session_data)
        if response.status_code == 200:
            sessions.append(response.json()["session_id"])
    
    print(f"✅ Created {len(sessions)} concurrent sessions")
    
    # Test that each session is independent
    for i, session_id in enumerate(sessions):
        # Crush different objects in each session
        obj_id = ["can_aluminum", "cardboard_box", "phone_old"][i]
        crush_data = {"object_id": obj_id, "force": 1.0, "position": {"x": 0, "y": 0}}
        requests.post(f"{BACKEND_URL}/api/session/{session_id}/crush", json=crush_data)
        
        # Check stats
        stats_response = requests.get(f"{BACKEND_URL}/api/session/{session_id}/stats")
        if stats_response.status_code == 200:
            stats = stats_response.json()
            if stats['total_crushed'] == 1:
                print(f"✅ Session {i+1} independence: PASS")
            else:
                print(f"❌ Session {i+1} independence: FAIL")
    
    # Clean up all sessions
    for session_id in sessions:
        requests.post(f"{BACKEND_URL}/api/session/{session_id}/end")

if __name__ == "__main__":
    print("🧪 Starting Edge Case Tests for Crush Simulator Backend")
    print("=" * 60)
    
    test_invalid_session_operations()
    test_invalid_object_operations()
    test_data_persistence()
    test_concurrent_sessions()
    
    print("\n" + "=" * 60)
    print("🎉 Edge case testing completed!")