#!/bin/bash

SERVICE_NAME="quiz-management"
IMAGE_NAME="quiz-management:v1.0.0"
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"
PORT_FORWARD_LOG="$LOG_DIR/port-forward-$(date +%Y%m%d-%H%M%S).log"


mkdir -p "$LOG_DIR"


cd "$(dirname "$0")"


log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Starting deployment for $SERVICE_NAME ==="


log "Pulling latest code from Git..."
git pull origin main 2>&1 | tee -a "$LOG_FILE"


log "Switching to Minikube's Docker environment..."
eval $(minikube -p minikube docker-env)

log "Removing old Docker image ($IMAGE_NAME)..."
docker rmi -f $IMAGE_NAME 2>/dev/null || true

log "Building Docker image..."
docker build --no-cache -t $IMAGE_NAME . 2>&1 | tee -a "$LOG_FILE"

log "Deploying to Minikube Kubernetes..."
kubectl apply -f k8s/ 2>&1 | tee -a "$LOG_FILE"

log "Waiting for deployment to complete..."
kubectl rollout status deployment/quiz-management-deployment 2>&1 | tee -a "$LOG_FILE"

log "=== Deployment completed for $SERVICE_NAME ==="

log "Cleaning up old port forwards if any..."
kill $(cat logs/port-forward-http.pid) 2>/dev/null || true
kill $(cat logs/port-forward-grpc.pid) 2>/dev/null || true


log "Starting port forwarding (logs: $PORT_FORWARD_LOG)..."

# Forward REST API (port 5001 on cluster to 30501 on localhost)
kubectl port-forward svc/quiz-management-service 30501:5001 >> "$PORT_FORWARD_LOG" 2>&1 & echo $! > "$LOG_DIR/port-forward-http.pid"

# Forward gRPC API (port 50051 on cluster to 30551 on localhost)
kubectl port-forward svc/quiz-management-service 30551:50051 >> "$PORT_FORWARD_LOG" 2>&1 & echo $! > "$LOG_DIR/port-forward-grpc.pid"

log "Port forwarding started:"
log "- REST: http://localhost:30501"
log "- gRPC: localhost:30551"
