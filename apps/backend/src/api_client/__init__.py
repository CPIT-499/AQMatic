# src/api_client/base_client.py
import requests
from abc import ABC, abstractmethod

class BaseAPIClient(ABC):
    def __init__(self, api_key: str):
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        })
    
    @abstractmethod
    def fetch_data(self, *args, **kwargs):
        pass