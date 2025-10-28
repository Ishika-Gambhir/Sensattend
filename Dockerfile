FROM python:3.11-slim

# Set environment vars
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

COPY ./server/requirements.txt .

RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

WORKDIR /app/client

RUN npm install && npm run build

WORKDIR /app/server

ENV FLASK_APP=server.py
ENV FLASK_ENV=production

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
# CMD ["python", "server.py"]