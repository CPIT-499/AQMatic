# filepath: c:\IT\Smesters\th7_SMESTER\CPIT-499\AQMatic\apps\backend\docker\fastapi\Dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./API /app/API

CMD ["uvicorn", "API.API:app", "--host", "0.0.0.0", "--port", "8000"]