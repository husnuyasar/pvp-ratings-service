# pvp-ratings-service

Backend service for 1v1 PvP player ratings built with NestJS, PostgreSQL, TypeORM, and OpenSkill. Ships with Swagger UI, Docker Compose, and a simple health endpoint.

## Requirements

- Node.js 18+ (recommended 20)

- Docker & Docker Compose (for containerized run)

- PostgreSQL (if running locally without Docker)

## Project setup
```bash
npm install
```
Copy env
```bash
.env
```
## Compile and run the project
```bash
npm run start
```
## Test
```bash
npm run test
```
## Run with Docker
```bash
# build images and start services
docker-compose up --build
```
- Swagger: http://localhost:8080/swagger

- Health: http://localhost:8080/healthz
## API Docs (Swagger)
```text
GET  /swagger       -> OpenAPI/Swagger UI
```
Open in browser:
```http
http://localhost:8080/swagger
```
## Health
```text
GET  /healthz       -> { success: boolean, version?: string }
```
Open in browser:
```http
http://localhost:8080/healthz
```
## Endpoints Overview
### Player
```text
GET    /player/top10        -> Returns the top 10 players ordered by rating (desc)
GET    /player/:id          -> Get a player by UUID v4
POST   /player/add          -> Create a new player
```
#### Create player – body
```json
{
  "username": "ash"
}
```
### Match
```text
GET    /match               -> Returns all matches with player relations
POST   /match               -> Create a 1v1 match
```
#### Create match – body
```json
{
  "playerAId": "b0203a19-ea00-423c-b53a-0e22ca499e29",
  "playerBId": "d47b4ae3-6480-4ba3-b0bd-d7096aa96650",
  "scoreA": 3,
  "scoreB": 1
}
```
### Player Rating History
```text
GET    /player-rating-history -> Returns all history with player & match relations
```
## 📄 License
MIT License © 2025 @husnuyasar
