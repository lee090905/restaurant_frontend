# Frontend

## Build Docker image

```bash
docker build -t restaurants-frontend:latest .
```

## Run container

```bash
docker run -p 3000:80 restaurants-frontend:latest
```

Then access the app at `http://localhost:3000`

## With docker-compose

```bash
docker-compose up
```
