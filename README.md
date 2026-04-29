# SportMap – Multi-Sport Platform Backend

> Platformă web construită în jurul unei hărți interactive care centralizează locurile de sport și permite organizarea meciurilor în timp real.

Backend **ASP.NET Core 8 Web API** structurat pe principii de **Clean Architecture**.

---

## Cuprins

1. [Arhitectură](#arhitectură)
2. [Tech Stack](#tech-stack)
3. [Structura proiectului](#structura-proiectului)
4. [Prerequisite](#prerequisite)
5. [Setup](#setup)
6. [Rulare](#rulare)
7. [Migrări bază de date](#migrări-bază-de-date)
8. [Endpoint-uri](#endpoint-uri)
9. [Autentificare](#autentificare)
10. [Git Workflow](#git-workflow)
11. [Conventional Commits](#conventional-commits)

---

## Arhitectură

```
┌──────────────────────────────────────────────────────────┐
│                      SportMap.API                        │  ← Prezentare (HTTP)
│   Controllers · Middleware · Swagger · Program.cs        │
└─────────────────────┬────────────────────────────────────┘
                      │ depinde de
                      ▼
┌──────────────────────────────────────────────────────────┐
│                 SportMap.Infrastructure                   │  ← Implementări externe
│   EF Core · Repositories · BCrypt · JWT · Email         │
└─────────────────────┬────────────────────────────────────┘
                      │ depinde de
                      ▼
┌──────────────────────────────────────────────────────────┐
│                    SportMap.Core                          │  ← Business logic
│      Entități · Servicii · Interfețe · Excepții         │
└─────────────────────┬────────────────────────────────────┘
                      │ depinde de
                      ▼
┌──────────────────────────────────────────────────────────┐
│                   SportMap.Models                         │  ← Contracte partajate
│                  DTOs · Request/Response                  │
└──────────────────────────────────────────────────────────┘
```

`Core` nu referențiază niciodată `Infrastructure` sau `API`. Infrastructure implementează interfețele din Core și sunt înregistrate în DI în `Program.cs`.

---

## Tech Stack

| Categorie | Tehnologie |
|---|---|
| Framework | ASP.NET Core 8 Web API |
| Limbaj | C# 12 / .NET 8 |
| Bază de date | Microsoft SQL Server |
| ORM | Entity Framework Core 8 |
| Autentificare | JWT Bearer + BCrypt (work factor 12) |
| Email | SendGrid |
| Documentație API | Swagger / OpenAPI (Swashbuckle 6.7) |
| Frontend (repo separat) | Angular |
| Hărți | Google Maps API |

---

## Structura proiectului

```
SportMap/
├── SportMap.sln
├── README.md
└── src/
    ├── SportMap.API/                        # Host HTTP
    │   ├── Controllers/
    │   │   ├── AuthController.cs            # /api/auth/*
    │   │   ├── UsersController.cs           # /api/users/*
    │   │   └── HealthController.cs          # /api/health
    │   ├── Middleware/
    │   │   └── ExceptionHandlingMiddleware.cs
    │   ├── Swagger/
    │   │   └── TagDescriptionsDocumentFilter.cs
    │   ├── appsettings.json
    │   ├── appsettings.Development.json
    │   └── Program.cs
    │
    ├── SportMap.Core/                       # Business logic (zero dependențe externe)
    │   ├── Entities/
    │   │   ├── User.cs
    │   │   ├── Activity.cs
    │   │   ├── Location.cs
    │   │   └── Participation.cs
    │   ├── Exceptions/
    │   │   └── DomainExceptions.cs
    │   ├── Interfaces/
    │   │   ├── Repositories/
    │   │   │   ├── IUserRepository.cs
    │   │   │   └── IActivityRepository.cs
    │   │   └── Services/
    │   │       ├── IAuthService.cs
    │   │       ├── IUserService.cs
    │   │       ├── IActivityService.cs
    │   │       ├── IEmailService.cs
    │   │       ├── IPasswordHasher.cs
    │   │       └── IJwtTokenGenerator.cs
    │   └── Services/
    │       ├── AuthService.cs
    │       ├── UserService.cs
    │       └── ActivityService.cs
    │
    ├── SportMap.Infrastructure/             # Implementări EF Core, BCrypt, JWT, Email
    │   ├── Data/
    │   │   └── SportMapDbContext.cs
    │   ├── Email/
    │   ├── Migrations/
    │   ├── Repositories/
    │   │   ├── UserRepository.cs
    │   │   └── ActivityRepository.cs
    │   ├── Security/
    │   │   └── JwtTokenGenerator.cs
    │   └── DependencyInjection.cs
    │
    └── SportMap.Models/                     # DTOs partajate între layere
        └── DTOs/
            ├── Auth/
            │   ├── RegisterDto.cs
            │   ├── LoginDto.cs
            │   ├── RefreshRequestDto.cs
            │   ├── AuthResponseDto.cs
            │   └── RegisterResponseDto.cs
            ├── Users/
            │   ├── UserDto.cs
            │   ├── UpdateUserDto.cs
            │   └── ChangePasswordDto.cs
            └── Activities/
                └── ActivityDto.cs
```

---

## Prerequisite

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- Microsoft SQL Server (LocalDB / Express / Full)
- EF Core CLI:
  ```bash
  dotnet tool install --global dotnet-ef
  ```

---

## Setup

1. **Clonare**
   ```bash
   git clone https://github.com/<org>/SportMap.git
   cd SportMap
   ```

2. **Restore pachete**
   ```bash
   dotnet restore
   ```

3. **Connection string** — editează `src/SportMap.API/appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=SportMapDb;Trusted_Connection=True;TrustServerCertificate=True;"
     }
   }
   ```

4. **JWT Secret** (nu comite secrete în repo):
   ```bash
   cd src/SportMap.API
   dotnet user-secrets init
   dotnet user-secrets set "Jwt:Secret" "$(openssl rand -base64 48)"
   ```

5. **Build**
   ```bash
   dotnet build
   ```

---

## Rulare

```bash
cd src/SportMap.API
dotnet run
```

| Interfață | URL |
|---|---|
| HTTP | http://localhost:5000 |
| HTTPS | https://localhost:5001 |
| Swagger UI | https://localhost:5001/swagger |

---

## Migrări bază de date

```bash
# Creare migrare nouă
dotnet ef migrations add <NumeMigrare> \
  --project src/SportMap.Infrastructure \
  --startup-project src/SportMap.API

# Aplicare la baza de date
dotnet ef database update \
  --project src/SportMap.Infrastructure \
  --startup-project src/SportMap.API

# Rollback ultima migrare
dotnet ef migrations remove \
  --project src/SportMap.Infrastructure \
  --startup-project src/SportMap.API
```

---

## Endpoint-uri

> **Legendă** — `—` = public (fără autentificare) · `🔒` = necesită JWT Bearer

### Auth — `/api/auth`

#### `POST /api/auth/register` — Înregistrare cont nou

**Public**

**Request:**
```json
{
  "username": "ion_popescu",
  "email": "ion.popescu@example.com",
  "password": "Parola@123"
}
```

**Response `201 Created`:**
```json
{
  "userId": 7,
  "email": "ion.popescu@example.com",
  "message": "Account created. Please check your email to confirm your address."
}
```

**Erori:** `400` date invalide · `409` email/username deja înregistrat

---

#### `GET /api/auth/confirm-email?token=<token>` — Confirmare email

**Public** · Token primit pe email după înregistrare.

**Response `200 OK`:**
```json
{ "message": "Email confirmed successfully. You can now log in." }
```

**Erori:** `400` token invalid/expirat · `404` token negăsit

---

#### `POST /api/auth/login` — Autentificare

**Public**

**Request:**
```json
{
  "email": "ion.popescu@example.com",
  "password": "Parola@123"
}
```

**Response `200 OK`:**
```json
{
  "userId": 7,
  "username": "ion_popescu",
  "email": "ion.popescu@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-04-29T14:00:00Z",
  "refreshToken": "dGhpcyBpcyBhIHNhbXBsZSByZWZyZXNoIHRva2Vu",
  "refreshTokenExpiry": "2026-05-06T13:45:00Z"
}
```

**Erori:** `401` credențiale incorecte sau email neconfirmat

---

#### `POST /api/auth/refresh` — Reînnoire token JWT

**Public** · Folosește `refreshToken` din răspunsul de login.

**Request:**
```json
{ "refreshToken": "dGhpcyBpcyBhIHNhbXBsZSByZWZyZXNoIHRva2Vu" }
```

**Response `200 OK`:** același format ca Login.

**Erori:** `401` refresh token invalid, expirat sau revocat

---

#### `POST /api/auth/logout` — Deconectare 🔒

**Revocă refresh token-ul.** JWT-ul activ rămâne valid până la expirare naturală (max 15 min).

**Response `200 OK`:**
```json
{ "message": "Logged out successfully." }
```

---

### Users — `/api/users`

Toate endpoint-urile de mai jos necesită **JWT Bearer 🔒**.

---

#### `GET /api/users` — Listă utilizatori

**Response `200 OK`:**
```json
[
  {
    "id": 7,
    "username": "ion_popescu",
    "email": "ion.popescu@example.com",
    "profilePhotoUrl": null,
    "favoriteSports": "fotbal, tenis",
    "createdAt": "2026-04-29T13:00:00Z"
  }
]
```

---

#### `GET /api/users/{id}` — Detalii utilizator

**Response `200 OK`:** același format ca mai sus (obiect unic).

**Erori:** `404` utilizator inexistent

---

#### `GET /api/users/me` — Profilul meu

Returnează datele utilizatorului extras din JWT.

**Response `200 OK`:** același format ca `GET /api/users/{id}`.

---

#### `PUT /api/users/me` — Actualizare profil

Câmpurile `null` sunt ignorate (semantică PATCH).

**Request:**
```json
{
  "username": "ion_popescu_nou",
  "profilePhotoUrl": "https://example.com/avatar.jpg",
  "favoriteSports": "fotbal, tenis, ciclism"
}
```

**Response `200 OK`:** profilul actualizat (același format ca `UserDto`).

**Erori:** `409` username deja folosit

---

#### `POST /api/users/me/change-password` — Schimbare parolă

**Request:**
```json
{
  "currentPassword": "Parola@123",
  "newPassword": "NovaParola@456"
}
```

**Response `200 OK`:**
```json
{ "message": "Password changed successfully." }
```

**Erori:** `401` parolă curentă incorectă

---

#### `DELETE /api/users/me` — Ștergere cont

Șterge definitiv contul și toate datele asociate. **Ireversibil.**

**Response `200 OK`:**
```json
{ "message": "Account deleted successfully." }
```

---

#### `GET /api/users/{id}/activities` — Activitățile unui utilizator

**Response `200 OK`:**
```json
[
  {
    "id": 42,
    "title": "Meci amical de fotbal în Parcul Herăstrău",
    "sport": "fotbal",
    "dateTime": "2026-05-02T19:00:00Z",
    "maxParticipants": 10,
    "type": "public",
    "organizerId": 7,
    "locationId": 3,
    "participantCount": 6,
    "createdAt": "2026-04-29T13:00:00Z",
    "updatedAt": null
  }
]
```

**Erori:** `404` utilizator inexistent

---

### Health — `/api/health`

#### `GET /api/health` — Health check

**Public** · Util pentru load balancers și monitoring.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-29T13:45:00Z",
  "service": "SportMap.API"
}
```

---

### Rezumat endpoint-uri

| Metodă | Rută | Auth | Descriere |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Înregistrare cont nou |
| `GET` | `/api/auth/confirm-email` | — | Confirmare email |
| `POST` | `/api/auth/login` | — | Autentificare + JWT |
| `POST` | `/api/auth/refresh` | — | Reînnoire token JWT |
| `POST` | `/api/auth/logout` | 🔒 | Deconectare |
| `GET` | `/api/users` | 🔒 | Listă utilizatori |
| `GET` | `/api/users/{id}` | 🔒 | Detalii utilizator |
| `GET` | `/api/users/me` | 🔒 | Profilul meu |
| `PUT` | `/api/users/me` | 🔒 | Actualizare profil |
| `POST` | `/api/users/me/change-password` | 🔒 | Schimbare parolă |
| `DELETE` | `/api/users/me` | 🔒 | Ștergere cont |
| `GET` | `/api/users/{id}/activities` | 🔒 | Activitățile unui utilizator |
| `GET` | `/api/health` | — | Health check |

---

## Autentificare

Autentificarea folosește **JWT Bearer** semnat cu **HMAC-SHA256**. Parolele sunt hashuite cu **BCrypt** (work factor 12).

**Flow complet:**
1. `POST /api/auth/register` → cont creat, email de confirmare trimis
2. `GET /api/auth/confirm-email?token=...` → cont activat
3. `POST /api/auth/login` → primești `token` (JWT, 15 min) + `refreshToken` (7 zile)
4. Folosești `token` în header-ul `Authorization: Bearer <token>` pentru endpointurile 🔒
5. La expirarea JWT: `POST /api/auth/refresh` cu `refreshToken` → nou JWT fără reautentificare
6. `POST /api/auth/logout` → revocă refresh token-ul

**Format eroare standard:**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid credentials."
}
```

---

## Git Workflow

Workflow **trunk-based** cu feature branches scurte.

```bash
git checkout main && git pull
git checkout -b feat/activities-crud
# ... commits ...
git push -u origin feat/activities-crud
# deschide Pull Request → target: main
```

**Naming convenții:**
- `feat/<descriere>` — funcționalitate nouă
- `fix/<descriere>` — bug fix
- `refactor/<descriere>` — restructurare fără schimbare de comportament
- `chore/<descriere>` — tooling / configurare
- `docs/<descriere>` — documentație

---

## Conventional Commits

```
<type>(<scope opțional>): <descriere scurtă>
```

**Tipuri:** `feat` · `fix` · `docs` · `refactor` · `perf` · `test` · `build` · `ci` · `chore`

**Exemple:**
```
feat(auth): add email confirmation flow
fix(users): prevent duplicate username on update
refactor(core): extract password hashing into IPasswordHasher
chore(deps): upgrade EF Core to 8.0.10
```

**Breaking change:**
```
feat(auth)!: switch from HS256 to RS256

BREAKING CHANGE: clients must be reconfigured with the new public key.
```
