FROM ds-remote-docker-dev-pb.bas-common.dspace.de/node:22.23-slim AS frontend-build
WORKDIR /src/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

COPY backend/TodoApp.Api/TodoApp.Api.csproj backend/TodoApp.Api/
RUN dotnet restore backend/TodoApp.Api/TodoApp.Api.csproj

COPY backend/ backend/
COPY --from=frontend-build /src/frontend/dist backend/TodoApp.Api/wwwroot/

WORKDIR /src/backend/TodoApp.Api
RUN dotnet publish TodoApp.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    --no-self-contained

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENV HttpsRedirection__Enabled=false

RUN apt-get update \
    && apt-get install --no-install-recommends --yes curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=backend-build /app/publish .
ENTRYPOINT ["dotnet", "TodoApp.Api.dll"]
