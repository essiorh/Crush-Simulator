#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Crush Simulator
Tests all endpoints and functionality as requested in the review.
"""

import requests
import json
import time
from typing import Dict, Any

# Backend URL from frontend .env
BACKEND_URL = "http://localhost:8001"

class CrushSimulatorTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def test_api_health(self) -> bool:
        """Test GET /api/ - API health check"""
        try:
            response = requests.get(f"{self.base_url}/api/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "status" in data:
                    self.log_test("API Health Check", True, f"Status: {data['status']}")
                    return True
                else:
                    self.log_test("API Health Check", False, "Missing required fields in response")
                    return False
            else:
                self.log_test("API Health Check", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Health Check", False, f"Connection error: {str(e)}")
            return False
            
    def test_get_objects(self) -> bool:
        """Test GET /api/objects - get all crushable objects"""
        try:
            response = requests.get(f"{self.base_url}/api/objects")
            if response.status_code == 200:
                data = response.json()
                if "objects" in data and isinstance(data["objects"], list):
                    objects = data["objects"]
                    if len(objects) > 0:
                        # Check if objects have required fields
                        required_fields = ["id", "name", "type", "difficulty", "satisfaction_score", "crush_time", "vibration_pattern"]
                        first_obj = objects[0]
                        missing_fields = [field for field in required_fields if field not in first_obj]
                        
                        if not missing_fields:
                            self.log_test("Get Objects", True, f"Found {len(objects)} objects with all required fields")
                            return True
                        else:
                            self.log_test("Get Objects", False, f"Missing fields: {missing_fields}")
                            return False
                    else:
                        self.log_test("Get Objects", False, "No objects returned")
                        return False
                else:
                    self.log_test("Get Objects", False, "Invalid response format")
                    return False
            else:
                self.log_test("Get Objects", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Objects", False, f"Error: {str(e)}")
            return False
            
    def test_get_modes(self) -> bool:
        """Test GET /api/modes - get game modes"""
        try:
            response = requests.get(f"{self.base_url}/api/modes")
            if response.status_code == 200:
                data = response.json()
                if "modes" in data and isinstance(data["modes"], list):
                    modes = data["modes"]
                    expected_modes = ["interactive", "auto", "mixed"]
                    mode_ids = [mode["id"] for mode in modes if "id" in mode]
                    
                    if all(mode_id in mode_ids for mode_id in expected_modes):
                        self.log_test("Get Game Modes", True, f"All expected modes present: {mode_ids}")
                        return True
                    else:
                        self.log_test("Get Game Modes", False, f"Missing modes. Found: {mode_ids}")
                        return False
                else:
                    self.log_test("Get Game Modes", False, "Invalid response format")
                    return False
            else:
                self.log_test("Get Game Modes", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Game Modes", False, f"Error: {str(e)}")
            return False
            
    def test_start_session(self) -> bool:
        """Test POST /api/session/start - create new game session"""
        try:
            session_data = {
                "mode": "interactive",
                "objects_crushed": [],
                "total_satisfaction": 0,
                "session_duration": 0
            }
            
            response = requests.post(f"{self.base_url}/api/session/start", json=session_data)
            if response.status_code == 200:
                data = response.json()
                if "session_id" in data and "message" in data:
                    self.session_id = data["session_id"]
                    self.log_test("Start Session", True, f"Session ID: {self.session_id}")
                    return True
                else:
                    self.log_test("Start Session", False, "Missing session_id or message in response")
                    return False
            else:
                self.log_test("Start Session", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Start Session", False, f"Error: {str(e)}")
            return False
            
    def test_crush_object(self) -> bool:
        """Test POST /api/session/{id}/crush - perform crush action"""
        if not self.session_id:
            self.log_test("Crush Object", False, "No active session")
            return False
            
        try:
            # First get available objects to crush
            objects_response = requests.get(f"{self.base_url}/api/objects")
            if objects_response.status_code != 200:
                self.log_test("Crush Object", False, "Could not get objects list")
                return False
                
            objects = objects_response.json()["objects"]
            test_object = objects[0]  # Use first object for testing
            
            crush_data = {
                "object_id": test_object["id"],
                "force": 1.5,
                "position": {"x": 100, "y": 200}
            }
            
            response = requests.post(f"{self.base_url}/api/session/{self.session_id}/crush", json=crush_data)
            if response.status_code == 200:
                data = response.json()
                required_fields = ["object", "success", "satisfaction_gained", "particles", "sound", "vibration"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("Crush Object", True, f"Crushed {test_object['name']}, satisfaction: {data['satisfaction_gained']}")
                    return True
                else:
                    self.log_test("Crush Object", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Crush Object", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Crush Object", False, f"Error: {str(e)}")
            return False
            
    def test_get_session_stats(self) -> bool:
        """Test GET /api/session/{id}/stats - get session statistics"""
        if not self.session_id:
            self.log_test("Get Session Stats", False, "No active session")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/api/session/{self.session_id}/stats")
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_crushed", "total_satisfaction", "objects_crushed", "session_duration"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("Get Session Stats", True, f"Stats: {data['total_crushed']} crushed, {data['total_satisfaction']} satisfaction")
                    return True
                else:
                    self.log_test("Get Session Stats", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Get Session Stats", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Session Stats", False, f"Error: {str(e)}")
            return False
            
    def test_end_session(self) -> bool:
        """Test POST /api/session/{id}/end - end session"""
        if not self.session_id:
            self.log_test("End Session", False, "No active session")
            return False
            
        try:
            response = requests.post(f"{self.base_url}/api/session/{self.session_id}/end")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "stats" in data:
                    self.log_test("End Session", True, "Session ended successfully")
                    return True
                else:
                    self.log_test("End Session", False, "Missing message or stats in response")
                    return False
            else:
                self.log_test("End Session", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("End Session", False, f"Error: {str(e)}")
            return False
            
    def test_multiple_game_modes(self) -> bool:
        """Test creating sessions with different game modes"""
        modes = ["interactive", "auto", "mixed"]
        success_count = 0
        
        for mode in modes:
            try:
                session_data = {
                    "mode": mode,
                    "objects_crushed": [],
                    "total_satisfaction": 0,
                    "session_duration": 0
                }
                
                response = requests.post(f"{self.base_url}/api/session/start", json=session_data)
                if response.status_code == 200:
                    data = response.json()
                    if "session_id" in data:
                        success_count += 1
                        # Clean up session
                        requests.post(f"{self.base_url}/api/session/{data['session_id']}/end")
                        
            except Exception as e:
                pass
                
        if success_count == len(modes):
            self.log_test("Multiple Game Modes", True, f"All {len(modes)} modes work correctly")
            return True
        else:
            self.log_test("Multiple Game Modes", False, f"Only {success_count}/{len(modes)} modes work")
            return False
            
    def test_object_details(self) -> bool:
        """Test GET /api/objects/{object_id} - get specific object details"""
        try:
            # Get objects list first
            objects_response = requests.get(f"{self.base_url}/api/objects")
            if objects_response.status_code != 200:
                self.log_test("Object Details", False, "Could not get objects list")
                return False
                
            objects = objects_response.json()["objects"]
            test_object_id = objects[0]["id"]
            
            response = requests.get(f"{self.base_url}/api/objects/{test_object_id}")
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "name", "type", "difficulty", "satisfaction_score"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("Object Details", True, f"Got details for {data['name']}")
                    return True
                else:
                    self.log_test("Object Details", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Object Details", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Object Details", False, f"Error: {str(e)}")
            return False
            
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🧪 Starting Crush Simulator Backend API Tests")
        print("=" * 50)
        
        # Test sequence
        tests = [
            self.test_api_health,
            self.test_get_objects,
            self.test_object_details,
            self.test_get_modes,
            self.test_start_session,
            self.test_crush_object,
            self.test_get_session_stats,
            self.test_end_session,
            self.test_multiple_game_modes
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
                time.sleep(0.5)  # Small delay between tests
            except Exception as e:
                print(f"❌ Test failed with exception: {str(e)}")
                
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All backend API tests PASSED!")
            return True
        else:
            print(f"⚠️  {total - passed} tests FAILED")
            return False
            
    def get_summary(self):
        """Get test summary"""
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        return {
            "total_tests": total,
            "passed": passed,
            "failed": total - passed,
            "success_rate": (passed / total * 100) if total > 0 else 0,
            "details": self.test_results
        }

if __name__ == "__main__":
    tester = CrushSimulatorTester()
    success = tester.run_all_tests()
    
    # Print detailed summary
    summary = tester.get_summary()
    print(f"\n📈 Success Rate: {summary['success_rate']:.1f}%")
    
    if not success:
        print("\n❌ Failed Tests:")
        for result in summary['details']:
            if not result['success']:
                print(f"  - {result['test']}: {result['details']}")