# SportMap API Specification

**Base URL:** `https://localhost:5001`
**Format:** JSON over HTTPS
**Auth:** JWT Bearer (`Authorization: Bearer <token>`)

---

## Conventions

- All timestamps are **UTC ISO-8601** (`2026-04-28T13:45:00Z`).
- All endpoints return JSON. On error, the body has the shape:
  ```json
  { "status": 404, "error": "NotFound", "message": "User with ID 42 not found." }
  ```
- Validation failures (`400`) follow the ASP.NET Core `ValidationProblemDetails` shape.

---

## Endpoint Index

| # | Method | Route | Auth |
|---|---|---|---|
| 1 | `POST` | `/api/auth/register` | — |
| 2 | `POST` | `/api/auth/login` | — |
| 3 | `GET` | `/api/health` | — |
| 4 | `GET` | `/api/users` | JWT |
| 5 | `GET` | `/api/users/{id}` | JWT |
| 6 | `GET` | `/api/users/me` | JWT |
| 7 | `PUT` | `/api/users/me` | JWT |
| 8 | `POST` | `/api/users/me/change-password` | JWT |
| 9 | `DELETE` | `/api/users/me` | JWT |
| 10 | `POST` | `/api/auth/refresh` | JWT *(planned)* |
| 11 | `POST` | `/api/auth/logout` | JWT *(planned)* |
| 12 | `GET` | `/api/users/{id}/activities` | JWT *(planned)* |

---

## 1. Register

**`POST /api/auth/register`** — Create a new account and receive a JWT.

### Request
```http
POST /api/auth/register HTTP/1.1
Content-Type: application/json

{
  "username": "alex_runner",
  "email": "alex@example.com",
  "password": "SuperSecret123!"
}
```

### Response — `201 Created`
```json
{
  "userId": 7,
  "username": "alex_runner",
  "email": "alex@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-04-28T15:00:00Z"
}
```

### Errors
- `400 Bad Request` — invalid email, password too short.
- `409 Conflict` — email or username already in use.

---

## 2. Login

**`POST /api/auth/login`** — Authenticate and receive a JWT.

### Request
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "alex@example.com",
  "password": "SuperSecret123!"
}
```

### Response — `200 OK`
```json
{
  "userId": 7,
  "username": "alex_runner",
  "email": "alex@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-04-28T15:00:00Z"
}
```

### Errors
- `401 Unauthorized` — invalid email or password.

---

## 3. Health Check

**`GET /api/health`** — Service liveness probe.

### Response — `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2026-04-28T13:45:00Z",
  "service": "SportMap.API"
}
```

---

## 4. List Users

**`GET /api/users`** — Returns all users (admin/debug).

### Request
```http
GET /api/users HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### Response — `200 OK`
```json
[
  {
    "id": 7,
    "username": "alex_runner",
    "email": "alex@example.com",
    "profilePhotoUrl": null,
    "favoriteSports": "tennis,running",
    "createdAt": "2026-04-28T13:00:00Z"
  },
  {
    "id": 8,
    "username": "maria_baller",
    "email": "maria@example.com",
    "profilePhotoUrl": "https://cdn.example.com/avatars/8.png",
    "favoriteSports": "basketball",
    "createdAt": "2026-04-28T13:05:00Z"
  }
]
```

### Errors
- `401 Unauthorized` — missing / invalid token.

---

## 5. Get User by ID

**`GET /api/users/{id}`**

### Request
```http
GET /api/users/7 HTTP/1.1
Authorization: Bearer eyJ...
```

### Response — `200 OK`
```json
{
  "id": 7,
  "username": "alex_runner",
  "email": "alex@example.com",
  "profilePhotoUrl": null,
  "favoriteSports": "tennis,running",
  "createdAt": "2026-04-28T13:00:00Z"
}
```

### Errors
- `404 Not Found` — no user with that ID.

---

## 6. Get Current User

**`GET /api/users/me`** — Returns the authenticated user's profile (resolved from the JWT `sub` claim).

### Request
```http
GET /api/users/me HTTP/1.1
Authorization: Bearer eyJ...
```

### Response — `200 OK`
```json
{
  "id": 7,
  "username": "alex_runner",
  "email": "alex@example.com",
  "profilePhotoUrl": null,
  "favoriteSports": "tennis,running",
  "createdAt": "2026-04-28T13:00:00Z"
}
```

---

## 7. Update Current User

**`PUT /api/users/me`** — Update the authenticated user's profile. All fields are optional; omitted fields are left unchanged.

### Request
```http
PUT /api/users/me HTTP/1.1
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "username": "alex_the_runner",
  "profilePhotoUrl": "https://cdn.example.com/avatars/7.png",
  "favoriteSports": "tennis,running,padel"
}
```

### Response — `200 OK`
```json
{
  "id": 7,
  "username": "alex_the_runner",
  "email": "alex@example.com",
  "profilePhotoUrl": "https://cdn.example.com/avatars/7.png",
  "favoriteSports": "tennis,running,padel",
  "createdAt": "2026-04-28T13:00:00Z"
}
```

### Errors
- `409 Conflict` — username already in use.

---

## 8. Change Password

**`POST /api/users/me/change-password`** — Verifies the current password before applying the new one.

### Request
```http
POST /api/users/me/change-password HTTP/1.1
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "currentPassword": "SuperSecret123!",
  "newPassword": "EvenMoreSecret456!"
}
```

### Response — `204 No Content`

### Errors
- `401 Unauthorized` — current password is incorrect.
- `400 Bad Request` — new password too short.

---

## 9. Delete Current User

**`DELETE /api/users/me`** — Permanently deletes the current account.

### Request
```http
DELETE /api/users/me HTTP/1.1
Authorization: Bearer eyJ...
```

### Response — `204 No Content`

---

## 10. Refresh Token *(planned)*

**`POST /api/auth/refresh`** — Exchange an expiring token for a new one.

### Request
```http
POST /api/auth/refresh HTTP/1.1
Authorization: Bearer eyJ...
```

### Response — `200 OK`
```json
{
  "token": "eyJhbGciOi...",
  "expiresAt": "2026-04-28T16:00:00Z"
}
```

---

## 11. Logout *(planned)*

**`POST /api/auth/logout`** — Invalidates the current token (server-side blacklist).

### Response — `204 No Content`

---

## 12. List User Activities *(planned)*

**`GET /api/users/{id}/activities`** — Returns all activities the user has organized or joined.

### Response — `200 OK`
```json
[
  {
    "activityId": 42,
    "title": "Friday night football",
    "sport": "football",
    "dateTime": "2026-05-02T19:00:00Z",
    "locationId": 5,
    "role": "organizer"
  }
]
```

---

## Error Format

All non-2xx responses (except framework `ValidationProblemDetails`) follow this shape:

```json
{
  "status": 404,
  "error": "NotFound",
  "message": "User with ID 42 not found."
}
```

| HTTP Code | `error` value | When |
|---|---|---|
| 400 | `BadRequest` | Validation failure |
| 401 | `Unauthorized` | Missing/invalid token, wrong credentials |
| 404 | `NotFound` | Resource doesn't exist |
| 409 | `Conflict` | Unique constraint violation |
| 500 | `InternalServerError` | Unhandled exception |
