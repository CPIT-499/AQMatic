# AQMatic

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="logo/PNG_version_dark.png">
    <source media="(prefers-color-scheme: light)" srcset="logo/PNG_version.png">
    <img alt="AQMatic Logo" src="logo/PNG_version.png" width="200">
  </picture>
</p>

## Introduction

AQMatic is a comprehensive air quality monitoring system developed as a graduation project, funded by APSCO and supported by the Center of Excellence in Intelligent Engineering Systems (CEIES). The system collects, processes, and visualizes environmental data from both fixed and mobile sensors across Saudi Arabia. Built using a full-stack architecture — including FastAPI, PostgreSQL, Apache Airflow, and a Next.js frontend — AQMatic ensures real-time data flow and insightful visualizations.

The project is designed for scalability and future enhancement. It can easily integrate additional data sources such as satellite feeds, and the mobile sensing units can be upgraded into a distributed sensor network. Each node in the network can transmit data to a central processor (Raspberry Pi) which then pushes the data to the cloud. This modular and extensible design allows AQMatic to grow into a robust national-scale air quality intelligence platform.

---

## 🚀 Features

- 📡 **Sensor Network**: Fixed and mobile sensors send real-time environmental data.
- 🔄 **Data Pipeline (Airflow)**: Cleans, processes, and stores data into PostgreSQL.
- 🧠 **AI Forecasting**: Predicts future AQI and many gasses using trained models.
- 🌐 **FastAPI Backend**: Exposes data through secure RESTful endpoints.
- 📊 **Next.js Dashboard**: Visualizes live and historical air quality data.
- 🐳 **Dockerized Setup**: Run everything using Docker Compose.

---

## 🛠 Tech Stack

- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL
- Workflow: Apache Airflow
- Frontend: Next.js + React + TailwindCSS
- DevOps: Docker + Docker Compose

---
## 📂 Project Structure

```
AQMatic/
├── services/         # FastAPI backend
├── dags/             # Airflow DAGs for ETL
├── docker/           # Dockerfiles and init SQL
├── frontend/         # Next.js frontend
├── docker-compose.yml
└── .env.example
```

---

## 🧑‍💻 Getting Started

1. **Clone the repo**
```bash
git clone https://github.com/<your-org>/AQMatic.git
cd AQMatic
```

2. **Create .env file**
```bash
cp .env.example .env
```

3. **Start with Docker Compose**
```bash
docker-compose up --build
```

4. **Access the services**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/docs`
- Airflow UI: `http://localhost:8080`

---

## 📊 API Endpoints

- `GET /sensors` – List all sensors
- `POST /readings` – Submit a new reading
- `GET /forecast` – Get AQI forecast

---
## 🖼 Screenshots

### 📍 Landing Page

Home Page
<img width="1198" alt="Screenshot 1446-12-08 at 4 59 24 AM" src="https://github.com/user-attachments/assets/abab7376-d45c-430c-8fbe-01f0c53194ef" />
---
### 📈 Dashboard
Dashboard
<img width="1193" alt="Screenshot 1446-12-08 at 5 03 05 AM" src="https://github.com/user-attachments/assets/460394c8-8763-4834-a954-2bb63c7f36bb" />
---
### 🚗 Mobile Sensor Prototype
![Untitled-2025-01-27-1507](https://github.com/user-attachments/assets/95bd49db-a61b-4bdd-b600-9d4209fd0ba0)
---

## 👥 Contributors

- Abdulmohsen Ahmed Almutlaq – 2135011@kau.edu.sa
- Osama Yasser Alghamdi – osamayalghamdi@gmail.com

---

## 📄 License

This project is licensed under the MIT License.
