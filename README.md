# SportMap – Multi-Sport Platform Backend

> Web platform built around an interactive map that centralizes sports venues and lets users organize matches in real time.

This repository contains the **ASP.NET Core 8 Web API** backend for SportMap, structured around **Clean Architecture** principles.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Setup](#setup)
6. [Running the API](#running-the-api)
7. [Database Migrations](#database-migrations)
8. [API Documentation](#api-documentation)
9. [Authentication](#authentication)
10. [Git Workflow](#git-workflow)
11. [Conventional Commits](#conventional-commits)
12. [Team Contributions](#team-contributions)

---

## Architecture

The solution follows **Clean Architecture** with strict dependency direction: outer layers depend on inner layers, never the other way around.

```
┌─────────────────────────────────────────────────────────┐
│                       SportMap.API                       │  ← Presentation (HTTP)
│      Controllers · Middleware · Program.cs · Swagger     │
└──────────────────────┬──────────────────────────────────┘
                       │ depends on
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  SportMap.Infrastructure                 │  ← External concerns
│   EF Core DbContext · Repositories · BCrypt · JWT impl  │
└──────────────────────┬──────────────────────────────────┘
                       │ depends on
                       ▼
┌─────────────────────────────────────────────────────────┐
│                       SportMap.Core                      │  ← Business logic
│      Entities · Domain Services · Interfaces · Rules    │
└──────────────────────┬──────────────────────────────────┘
                       │ depends on
                       ▼
┌─────────────────────────────────────────────────────────┐
│                      SportMap.Models                     │  ← Shared contracts
│                   DTOs · Request/Response                │
└─────────────────────────────────────────────────────────┘
```

**Dependency Rule** — `Core` never references `Infrastructure` or `API`. Infrastructure provides concrete implementations (EF Core, BCrypt, JWT) of interfaces declared in Core, and they are wired up via Dependency Injection in `Program.cs`.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | ASP.NET Core 8 Web API |
| Language | C# 12 / .NET 8 |
| Database | Microsoft SQL Server |
| ORM | Entity Framework Core 8 |
| Authentication | JWT Bearer + BCrypt password hashing |
| API Documentation | Swagger / OpenAPI (Swashbuckle) |
| Frontend (separate repo) | Angular |
| Maps | Google Maps API |
| Email | SendGrid |

---

## Project Structure

```
SportMap/
├── SportMap.sln
├── README.md
├── .gitignore
├── .editorconfig
├── docs/
│   └── api-specification.md
└── src/
    ├── SportMap.API/                  # Web API host
    │   ├── Controllers/
    │   │   ├── AuthController.cs
    │   │   ├── UsersController.cs
    │   │   └── HealthController.cs
    │   ├── Middleware/
    │   │   └── ExceptionHandlingMiddleware.cs
    │   ├── Properties/launchSettings.json
    │   ├── appsettings.json
    │   └── Program.cs
    │
    ├── SportMap.Core/                 # Business logic (no external deps)
    │   ├── Entities/User.cs
    │   ├── Exceptions/DomainExceptions.cs
    │   ├── Interfaces/
    │   │   ├── Repositories/IUserRepository.cs
    │   │   └── Services/{IAuthService,IUserService,IPasswordHasher,IJwtTokenGenerator}.cs
    │   └── Services/
    │       ├── AuthService.cs
    │       └── UserService.cs
    │
    ├── SportMap.Infrastructure/       # EF Core, BCrypt, JWT
    │   ├── Data/SportMapDbContext.cs
    │   ├── Repositories/UserRepository.cs
    │   ├── Security/{BcryptPasswordHasher,JwtTokenGenerator,JwtSettings}.cs
    │   └── DependencyInjection.cs
    │
    └── SportMap.Models/               # DTOs shared across layers
        └── DTOs/
            ├── Auth/{RegisterDto,LoginDto,AuthResponseDto}.cs
            └── Users/{UserDto,UpdateUserDto,ChangePasswordDto}.cs
```

---

## Prerequisites

- **.NET 8 SDK** — <https://dotnet.microsoft.com/download>
- **Microsoft SQL Server** (LocalDB, Express, or full edition)
- **EF Core CLI tools**:
  ```bash
  dotnet tool install --global dotnet-ef
  ```
- A REST client (Postman, Insomnia, or the built-in Swagger UI)

---

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-org>/SportMap.git
   cd SportMap
   ```

2. **Restore NuGet packages**
   ```bash
   dotnet restore
   ```

3. **Configure the connection string**

   Edit `src/SportMap.API/appsettings.Development.json` (or use User Secrets):
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=SportMapDb;Trusted_Connection=True;TrustServerCertificate=True;"
     }
   }
   ```

4. **Set a real JWT secret** (do **not** commit production secrets)
   ```bash
   cd src/SportMap.API
   dotnet user-secrets init
   dotnet user-secrets set "Jwt:Secret" "$(openssl rand -base64 48)"
   ```

5. **Build the solution**
   ```bash
   dotnet build
   ```

---

## Running the API

```bash
cd src/SportMap.API
dotnet run
```

The API will be available at:
- HTTP — <http://localhost:5000>
- HTTPS — <https://localhost:5001>
- **Swagger UI** — <https://localhost:5001/swagger>

---

## Database Migrations

EF Core migrations are stored in the **Infrastructure** project but executed against the **API** startup project.

**Create a migration:**
```bash
dotnet ef migrations add InitialCreate \
  --project src/SportMap.Infrastructure \
  --startup-project src/SportMap.API
```

**Apply migrations to the database:**
```bash
dotnet ef database update \
  --project src/SportMap.Infrastructure \
  --startup-project src/SportMap.API
```

**Roll back the last migration:**
```bash
dotnet ef migrations remove \
  --project src/SportMap.Infrastructure \
  --startup-project src/SportMap.API
```

**Inspect the database** — open SQL Server Management Studio (SSMS) or Azure Data Studio and connect to `localhost`. The schema will appear under the `SportMapDb` database.

---

## API Documentation

The full request/response specification with examples is in [`docs/api-specification.md`](docs/api-specification.md).

When the API is running, an interactive Swagger UI is also available at `/swagger`.

### Endpoints at a glance

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create a new account |
| `POST` | `/api/auth/login` | — | Authenticate and receive a JWT |
| `GET` | `/api/users` | JWT | List all users |
| `GET` | `/api/users/{id}` | JWT | Get a user by ID |
| `GET` | `/api/users/me` | JWT | Get the current user's profile |
| `PUT` | `/api/users/me` | JWT | Update the current user's profile |
| `POST` | `/api/users/me/change-password` | JWT | Change the current user's password |
| `DELETE` | `/api/users/me` | JWT | Delete the current user's account |
| `GET` | `/api/health` | — | Service health check |

---

## Authentication

Authentication uses **JWT Bearer tokens** signed with **HMAC-SHA256**. Passwords are hashed with **BCrypt** (work factor 12).

**Flow:**
1. `POST /api/auth/register` or `POST /api/auth/login` → returns `{ token, expiresAt, ... }`
2. Send the token on subsequent requests:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
   ```

The token contains the following claims: `sub` (user id), `email`, `username`, `jti`, `exp`, `iss`, `aud`.

---

## Git Workflow

We use a **trunk-based feature-branch** workflow.

1. Create a branch off `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b feat/users-crud
   ```

2. Commit using [Conventional Commits](#conventional-commits).

3. Push and open a Pull Request:
   ```bash
   git push -u origin feat/users-crud
   ```

4. **Branch naming:**
   - `feat/<short-description>` — new feature
   - `fix/<short-description>` — bug fix
   - `chore/<short-description>` — tooling / config
   - `docs/<short-description>` — documentation only
   - `refactor/<short-description>` — code restructure with no behaviour change

5. **Pull Requests must:**
   - Target `main`
   - Have at least **one approval**
   - Pass CI (build + tests)
   - Use a Conventional Commit title (the squash-merge will use it)

---

## Conventional Commits

Format:
```
<type>(<optional scope>): <description>

[optional body]

[optional footer]
```

**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

**Examples:**
```
feat(auth): add JWT login endpoint
fix(users): prevent username collision on update
docs(readme): add migration commands
refactor(core): extract password hashing into IPasswordHasher
chore(ci): bump GitHub Actions to v4
```

**Breaking changes** — append `!` after the type/scope and explain in the footer:
```
feat(auth)!: switch tokens from HS256 to RS256

BREAKING CHANGE: clients must be reconfigured with the new public key.
```

---

## Team Contributions

| Member | Responsibility |
|---|---|
| _Your Name_ | Backend lead — API, Auth, Clean Architecture setup |
| _Teammate 1_ | Database schema, EF Core migrations, repository layer |
| _Teammate 2_ | Frontend (Angular), API integration |
| _Teammate 3_ | Maps integration, location features, testing |

> Replace this section with the actual team members and their contributions before submission.

---

## License

Educational project — University coursework. All rights reserved by the authors.
