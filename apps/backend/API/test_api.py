import unittest
from fastapi.testclient import TestClient
from .API import app
import time



# to run this test, use the command: docker exec -it backend-fastapi-1 python -m unittest API.test_api
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
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0, "Expected at least one entry in hourly measurement summary")

    def test_map_data_endpoint(self):
        """Test that the map data endpoint responds"""
        response = self.client.get("/map_data")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0, "Expected at least one entry in map data")
        
    def test_map_data_endpoint_content(self):
        """Test that the map data endpoint returns data with required fields"""
        response = self.client.get("/map_data")
        data = response.json()
        self.assertGreater(len(data), 0, "Expected at least one entry in map data")
        self.assertIn("latitude", data[0])
        self.assertIn("longitude", data[0])
        self.assertIn("pm25", data[0])
        self.assertIsInstance(data[0]["latitude"], (float, int))
        self.assertIsInstance(data[0]["longitude"], (float, int))
        self.assertTrue(isinstance(data[0]["pm25"], (float, int)) or data[0]["pm25"] is None)

    def test_hourly_measurements_with_parameters(self):
        """Test hourly measurements endpoint with query parameters"""
        response = self.client.get("/hourly_measurement_summary_View_graph?hours=24")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0, "Expected at least one entry with hours parameter")

    def test_summary_stats_endpoint_complete(self):
        """Test all expected fields in summary stats response"""
        response = self.client.get("/summary_stats")
        data = response.json()
        self.assertIsInstance(data, dict, "Summary stats should return a dictionary")
        self.assertGreater(len(data), 0, "Expected at least one field in summary stats")
        expected_fields = ["current_aqi", "pm25_level", "aqi_trend_pct", "pm25_trend_pct", 
                          "monitoring_stations", "alerts_today"]
        for field in expected_fields:
            self.assertIn(field, data)

    def test_invalid_endpoint(self):
        """Test behavior with invalid endpoint"""
        response = self.client.get("/nonexistent_endpoint")
        self.assertIn(response.status_code, [404, 405])

    def test_performance(self):
        """Simple performance test for the API endpoints"""
        start_time = time.time()
        self.client.get("/summary_stats")
        response_time = time.time() - start_time
        self.assertLess(response_time, 2.0)

    def test_all_endpoints_performance(self):
        """Test all major endpoints respond within 2 seconds"""
        endpoints = ["/", "/hourly_measurement_summary_View_graph", "/map_data", "/summary_stats"]
        for endpoint in endpoints:
            start_time = time.time()
            self.client.get(endpoint)
            response_time = time.time() - start_time
            self.assertLess(response_time, 2.0, f"{endpoint} took too long")

    def test_forecast_summary_endpoint(self):
        """Test forecast summary endpoint"""
        response = self.client.get("/forecast_summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)

    def test_hourly_measurements_edge_cases(self):
        """Test hourly measurements with invalid and extreme parameters"""
        response_invalid = self.client.get("/hourly_measurement_summary_View_graph?hours=abc")
        self.assertIn(response_invalid.status_code, [200, 400, 422, 500])
        response_extreme = self.client.get("/hourly_measurement_summary_View_graph?hours=9999")
        self.assertIn(response_invalid.status_code, [200, 400, 422, 500])

    def test_summary_stats_endpoint_fields(self):
        """Test that summary stats endpoint returns correct types"""
        response = self.client.get("/summary_stats")
        data = response.json()
        self.assertIn("current_aqi", data)
        self.assertTrue(isinstance(data["current_aqi"], (int, float)) or data["current_aqi"] is None)
        self.assertIn("pm25_level", data)
        self.assertTrue(isinstance(data["pm25_level"], (int, float)) or data["pm25_level"] is None)

if __name__ == "__main__":
    unittest.main()
