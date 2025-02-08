import sys, os
# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.db.connect import connect_to_db
from src.db.insert_data import insert_measurements
from datetime import datetime

def send_dic():
    dic = {'temperature': 22.5, 'humidity': 65.0}
    conn = connect_to_db()
    if conn:
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        insert_measurements(conn, 1, current_time, 1, dic)
        conn.close()