#!/bin/bash

SERVICE_NAME="quiz-management"
IMAGE_NAME="quiz-management:v1.0.0"
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"


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
