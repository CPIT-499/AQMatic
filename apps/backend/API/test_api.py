import unittest
from fastapi.testclient import TestClient

from .API import app

#### docker exec -it backend-fastapi-1 python -m unittest API.test_api

class TestAQMaticAPI(unittest.TestCase):
    """Simple test cases for the AQMatic API"""

    def setUp(self):
        """Set up test client"""
        self.client = TestClient(app)

    def test_read_root(self):
        """Test the root endpoint"""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"Hello": "AQMatic API"})



    def test_hourly_measurement_summary_endpoint(self):
        """Test that the hourly measurement summary endpoint responds"""
        response = self.client.get("/hourly_measurement_summary_View_graph")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_map_data_endpoint(self):
        """Test that the map data endpoint responds"""
        response = self.client.get("/map_data")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_summary_stats_endpoint(self):
        """Test that the summary stats endpoint responds"""
        response = self.client.get("/summary_stats")
        self.assertEqual(response.status_code, 200)
        # Check that key fields exist in the response
        data = response.json()
        self.assertIn("current_aqi", data)
        self.assertIn("pm25_level", data)


if __name__ == "__main__":
    unittest.main()