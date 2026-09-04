# Training ToDo App Setup

Run these commands from the project root. They create a clean, buildable application scaffold. The ToDo domain, API endpoints, UI, containers, Kubernetes resources, and tests can be added afterward.

## Prerequisites

```bash
git --version
dotnet --version
node --version
npm --version
docker --version
docker compose version
kubectl version --client
```

Install the following if they are not already available:

- Git
- .NET SDK 10 or newer
- Node.js 22 or newer with npm
- Docker Desktop or Docker Engine with Compose
- kubectl
- A local Kubernetes cluster such as Docker Desktop Kubernetes, kind, or minikube

## Create The Repository

```bash
git init
dotnet new gitignore
mkdir -p backend k8s
```

## Create The Backend

```bash
dotnet new sln --name TodoApp --format sln
dotnet new webapi --name TodoApp.Api --output backend/TodoApp.Api --framework net10.0
dotnet new xunit --name TodoApp.Api.Tests --output backend/TodoApp.Api.Tests --framework net10.0
dotnet sln TodoApp.sln add backend/TodoApp.Api/TodoApp.Api.csproj
dotnet sln TodoApp.sln add backend/TodoApp.Api.Tests/TodoApp.Api.Tests.csproj
dotnet add backend/TodoApp.Api.Tests/TodoApp.Api.Tests.csproj reference backend/TodoApp.Api/TodoApp.Api.csproj
mkdir -p backend/TodoApp.Api/{Controllers,Data,Models,Services}
mkdir -p backend/TodoApp.Api.Tests/{Controllers,Services}
dotnet restore
dotnet build
dotnet test

# Start the API during development.
dotnet run --project backend/TodoApp.Api
```

## Create The Frontend

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react@^19 react-dom@^19 @mui/material @emotion/react @emotion/styled @tanstack/react-query
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
mkdir -p src/{components,features,lib,pages,types}
cd ..
```

Add the development and test scripts to `frontend/package.json`:

```bash
npm --prefix frontend pkg set scripts.test="vitest run"
npm --prefix frontend pkg set scripts.test:watch="vitest"
npm --prefix frontend run build
```

Start the frontend during development:

```bash
npm --prefix frontend run dev
```

## Prepare Container And Kubernetes Directories

```bash
mkdir -p k8s/backend k8s/frontend
```

Create these implementation files next, when adding container and cluster support:

```text
backend/Dockerfile
frontend/Dockerfile
docker-compose.yml
k8s/backend/deployment.yaml
k8s/backend/service.yaml
k8s/frontend/deployment.yaml
k8s/frontend/service.yaml
k8s/ingress.yaml
```

## Verify Docker And Kubernetes

```bash
docker compose config # Run after docker-compose.yml is implemented.
docker build -t todo-api:local ./backend # Run after backend/Dockerfile is implemented.
docker build -t todo-frontend:local ./frontend # Run after frontend/Dockerfile is implemented.
kubectl config current-context
kubectl cluster-info
kubectl create namespace todo-app --dry-run=client -o yaml
```

For a kind cluster, create and configure it with:

```bash
kind create cluster --name todo-app
kubectl config use-context kind-todo-app
```

For minikube, use:

```bash
minikube start
eval "$(minikube docker-env)"
```

## Initial Commit

```bash
git add .
git status
git commit -m "Initialize training todo app"
```
