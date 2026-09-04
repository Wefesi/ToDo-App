# Training ToDo App Roadmap

This roadmap describes the implementation order for the Training ToDo App. Do
not move to the next milestone until the acceptance criteria for the current
milestone pass. Make a Git commit at the end of each milestone.

## 1. Establish the Baseline

### Objective

Create a reproducible project scaffold and verify that the generated backend
and frontend work before adding application features.

### Tasks

- Run `git status` and inspect any existing changes before editing the project.
- Confirm Git, .NET 10+, Node.js 22+, npm, Docker, Docker Compose, and Minikube
  are installed.
- Confirm the solution contains the API project and the test project.
- Confirm the React/Vite app exists under `frontend/` and dependencies are
  installed.
- Keep generated build output and dependencies out of Git through the existing
  ignore files.
- Create the backend folders `Controllers`, `Data`, `Models`, and `Services`.
- Create the frontend folders `src/components`, `src/features`, `src/lib`,
  `src/pages`, and `src/types`.
- Create `k8s/backend` and `k8s/frontend` for the later deployment manifests.

### Acceptance criteria

- `dotnet build` succeeds from the repository root.
- `dotnet test` succeeds, including the generated test project.
- `npm --prefix frontend run build` succeeds.
- `git status` shows only intentional source files.

### Commit

```bash
git add .
git commit -m "Initialize training todo app"
```

## 2. Define the ToDo Contract

### Objective

Agree on the data model and HTTP contract before implementing the API or UI.
The same names and shapes must be used by the backend tests, frontend API
client, and UI.

### Tasks

- Define a ToDo with an `id`, `title`, and `isCompleted` field.
- Use a numeric or GUID ID consistently across API responses, requests, and
  frontend TypeScript types.
- Require a non-empty title and choose a maximum title length, such as 200
  characters.
- Decide whether new ToDos start with `isCompleted: false` and document that
  behavior.
- Define these endpoints:

  - `GET /api/todos` returns `200` and an array of ToDos.
  - `POST /api/todos` accepts a title and optional completion state, returning
    `201` and the created ToDo.
  - `PUT /api/todos/{id}` accepts the editable ToDo fields, returning `200` and
    the updated ToDo.
  - `DELETE /api/todos/{id}` returns `204` when deletion succeeds.
- Return `400` for invalid input and `404` when the requested ID does not
  exist.
- Add the contract and example requests to
  `backend/TodoApp.Api/TodoApp.Api.http` or a dedicated API documentation
  file.

### Acceptance criteria

- The request and response shapes are written down.
- The API status codes for success, invalid input, and missing IDs are defined.
- The frontend can implement its API client without guessing field names.

## 3. Implement the Backend API

### Objective

Replace the generated weather endpoint with a tested REST API for ToDos.
Use an in-memory store first; persistence is not part of the stated project
requirements.

### Expected files

- `backend/TodoApp.Api/Models/ToDo.cs`
- `backend/TodoApp.Api/Models/CreateToDoRequest.cs`
- `backend/TodoApp.Api/Models/UpdateToDoRequest.cs`
- `backend/TodoApp.Api/Services/IToDoService.cs`
- `backend/TodoApp.Api/Services/ToDoService.cs`
- `backend/TodoApp.Api/Controllers/ToDosController.cs`, or equivalent minimal
  API endpoint definitions

### Tasks

- Remove the generated weather forecast endpoint and unused record.
- Implement an in-memory collection behind a service abstraction.
- Generate unique IDs and preserve created ToDos for the lifetime of the API
  process.
- Implement list, create, update, and delete operations.
- Validate request bodies and reject blank or overlong titles.
- Return the status codes defined in the contract.
- Register the service with the dependency injection container.
- Add `GET /health` returning a simple successful response for container and
  Kubernetes probes.
- Configure CORS for the local frontend origin during development.
- Keep HTTPS redirection compatible with local HTTP, Docker, and Kubernetes
  execution; document any required environment setting.

### Acceptance criteria

- All four CRUD endpoints work with valid requests.
- Invalid titles return `400` without changing stored data.
- Unknown IDs return `404` for update and delete.
- The API returns JSON matching the agreed contract.
- `GET /health` succeeds without requiring the frontend.

### Verification

```bash
dotnet build
dotnet run --project backend/TodoApp.Api
```

Exercise every endpoint using the HTTP file, `curl`, or an API client.

### Commit

```bash
git add backend
git commit -m "Implement todo backend API"
```

## 4. Add Backend Unit Tests

### Objective

Prove the core business behavior independently of the network, web server, and
future container environment.

### Tasks

- Remove or replace the generated placeholder test.
- Add service tests for an initially empty list and adding a ToDo.
- Test that each created ToDo receives a unique ID.
- Test editing an existing ToDo, including title and completion changes.
- Test deleting an existing ToDo and confirming it no longer appears.
- Test missing-ID update and delete behavior.
- Test blank and overlong title validation.
- Add endpoint/controller tests if needed to verify routing, model binding, and
  HTTP status codes not covered by service tests.
- Ensure each test creates its own service/store and does not depend on test
  order.

### Acceptance criteria

- Core service behavior has tests for success and failure paths.
- Tests do not require Docker, Minikube, or a running API process.
- `dotnet test` passes from the repository root.

### Commit

```bash
git add backend
git commit -m "Add backend unit tests"
```

## 5. Implement the React UI

### Objective

Build a usable Material UI screen that consumes the REST API through React
Query and supports every user story.

### Expected files

- `frontend/src/types/todo.ts`
- `frontend/src/lib/api.ts`
- `frontend/src/features/todos/` for query and mutation logic
- `frontend/src/components/` for reusable form and list components
- `frontend/src/pages/` for the main page

### Tasks

- Define TypeScript types matching the backend ToDo contract.
- Create an API client with functions for list, create, update, and delete.
- Read the API base URL from a Vite environment variable, with a documented
  local-development default.
- Create a `QueryClient` and wrap the application in
  `QueryClientProvider`.
- Add a query for `GET /api/todos`.
- Add mutations for create, update, and delete.
- Invalidate or update the `todos` query after each successful mutation.
- Build the page with Material UI components and accessible labels.
- Implement the user stories in this order: view, create, edit, delete.
- Display loading, empty, error, and mutation feedback states.
- Disable controls while an operation is pending where appropriate.
- Confirm the layout works on narrow mobile screens and desktop screens.

### Acceptance criteria

- A user can view all ToDos returned by the API.
- A user can submit a valid title and see the new ToDo.
- A user can edit a ToDo and see the changed values.
- A user can delete a ToDo and see it removed.
- API failures are visible and do not silently lose the current list.
- The frontend does not use a Kubernetes-only hostname during local development.

### Verification

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix frontend run dev
```

### Commit

```bash
git add frontend
git commit -m "Implement todo frontend"
```

## 6. Add Frontend Unit Tests

### Objective

Verify the UI behavior and API integration without requiring a deployed
backend, Docker, or Kubernetes.

### Tasks

- Configure Vitest with a browser-like `jsdom` environment and the testing
  library setup file.
- Test that the ToDo list renders returned items.
- Test loading, empty, and API-error states.
- Test required-title validation and that invalid forms do not submit.
- Test successful create, edit, and delete interactions.
- Mock API requests at the API-client boundary or with a request mock, keeping
  tests deterministic.
- Test that mutations refresh or update the displayed React Query data.
- Query elements by accessible role, label, or name rather than CSS details.

### Acceptance criteria

- Tests cover the main UI states and all four user stories.
- Tests pass without a running backend.
- `npm --prefix frontend test` and the production build pass.

### Verification

```bash
npm --prefix frontend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

### Commit

```bash
git add frontend
git commit -m "Add frontend unit tests"
```

## 7. Add Docker Support

### Objective

Package the backend and frontend as production-like containers and run them
together with Docker Compose.

### Expected files

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `frontend/nginx.conf` if Nginx is used to serve the built frontend
- `docker-compose.yml`

### Tasks

- Use a multi-stage .NET Dockerfile: restore, build, publish, then run only the
  published output in the runtime image.
- Configure the API container to listen on the port declared by Compose.
- Use a multi-stage frontend Dockerfile: install dependencies, run the Vite
  production build, then serve `dist/` with a static web server.
- Configure SPA fallback so browser routes resolve to `index.html`.
- Define backend and frontend services in Compose with explicit port mappings.
- Pass the frontend API base URL through the frontend build/runtime design.
- Add health checks or startup documentation where useful.
- Ensure the browser-visible API URL is used by frontend code. A browser cannot
  resolve a private Compose service name such as `backend`.
- Add `.dockerignore` files if build context contains unnecessary files.

### Acceptance criteria

- Both images build from the repository root commands.
- `docker compose config` reports valid configuration.
- `docker compose up --build` starts both services.
- The UI can perform all CRUD operations against the containerized API.

### Verification

```bash
docker compose config
docker build -t todo-api:local ./backend
docker build -t todo-frontend:local ./frontend
docker compose up --build
```

Stop Compose with `Ctrl+C` after testing the published URLs.

### Commit

```bash
git add backend/Dockerfile frontend/Dockerfile docker-compose.yml
git add frontend/nginx.conf backend/.dockerignore frontend/.dockerignore
git commit -m "Add Docker Compose support"
```

Only add the optional files if they were created.

## 8. Deploy to Minikube

### Objective

Run the same two application components in a local Kubernetes cluster with
Deployments, Services, and Ingress.

### Expected files

- `k8s/backend/deployment.yaml`
- `k8s/backend/service.yaml`
- `k8s/frontend/deployment.yaml`
- `k8s/frontend/service.yaml`
- `k8s/ingress.yaml`

### Tasks

- Start Minikube and point the local Docker CLI at Minikube's Docker daemon.
- Build both images after switching Docker environments.
- Use a namespace named `todo-app` consistently in commands or manifests.
- Define backend and frontend Deployments with matching labels and selectors.
- Set container ports and image names consistently with the Docker builds.
- Set `imagePullPolicy: IfNotPresent` for locally built images.
- Add readiness and liveness probes, using `/health` for the backend.
- Define ClusterIP Services whose selectors match their Deployments.
- Configure the frontend to call the backend through its Kubernetes Service or
  through the ingress path, according to the chosen routing design.
- Define Ingress rules for the frontend and `/api` backend traffic.
- Enable Minikube's ingress addon if it is not already enabled.
- Use a nip.io host such as `127.0.0.1.nip.io` for local ingress testing.
- Apply manifests, inspect events and logs, and wait for pods to become ready.

### Acceptance criteria

- Backend and frontend pods become ready in Minikube.
- Services select the intended pods.
- The ingress receives browser traffic.
- The deployed UI can complete view, create, edit, and delete operations.
- A backend failure produces a visible frontend error rather than an infinite
  loading state.

### Verification

```bash
minikube start
eval "$(minikube docker-env)"
docker build -t todo-api:local ./backend
docker build -t todo-frontend:local ./frontend
minikube addons enable ingress
minikube kubectl -- create namespace todo-app --dry-run=client -o yaml | minikube kubectl -- apply -f -
minikube kubectl -- apply -f k8s/ -n todo-app
minikube kubectl -- get deployments,services,pods -n todo-app
minikube kubectl -- get ingress -n todo-app
minikube kubectl -- describe ingress -n todo-app
```

Use the configured nip.io URL to test the application. If the ingress
controller is not reachable directly on the host, use the Minikube tunnel or
the platform-specific Minikube ingress instructions.

### Commit

```bash
git add k8s
git commit -m "Add Minikube deployment manifests"
```

## 9. Final Verification and Documentation

### Objective

Make the project understandable to another developer and prepare a reliable
demonstration for the mentor or team lead.

### Tasks

- Run backend and frontend tests from a clean working tree.
- Run linting and production builds.
- Validate Compose configuration and rebuild both images.
- Recreate or redeploy the Minikube resources and confirm readiness.
- Update `README.md` with prerequisites, local development commands, API
  endpoints, test commands, Compose usage, and Minikube usage.
- Document the ingress hostname and any required environment variables.
- Document the in-memory storage limitation and the fact that data resets when
  the API restarts.
- Review error handling, accessibility, responsive layout, and browser console
  errors.
- Optionally add CI/CD to run backend tests, frontend tests, linting, builds,
  and container builds.
- Prepare a 0.5-1 hour demonstration covering architecture, CRUD flows, tests,
  Docker Compose, and Kubernetes deployment.

### Final acceptance criteria

- Every technical requirement in `setup.md` and the project brief is satisfied
  or explicitly documented as optional.
- All four user stories work through the Kubernetes ingress URL.
- Backend and frontend unit tests pass.
- Docker Compose starts the application successfully.
- The project can be checked out and started using the README instructions.

### Final verification

```bash
dotnet test
npm --prefix frontend test
npm --prefix frontend run lint
npm --prefix frontend run build
docker compose config
git status
```

### Commit

```bash
git add README.md roadmap.md
git commit -m "Document and verify the application"
```

## Suggested Commit Milestones

1. `Initialize training todo app`
2. `Implement todo backend API`
3. `Add backend unit tests`
4. `Implement todo frontend`
5. `Add frontend unit tests`
6. `Add Docker Compose support`
7. `Add Minikube deployment manifests`
8. `Document and verify the application`
