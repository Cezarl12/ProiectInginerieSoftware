# SportMap

> O platformă web care conectează oamenii prin sport — găsești locuri, organizezi activități și îți construiești o comunitate sportivă.

---

## Ce este SportMap?

SportMap este o aplicație full-stack construită ca proiect personal, cu scopul de a centraliza tot ce ține de viața sportivă urbană: unde poți juca, cu cine, și când.

Harta interactivă afișează zeci de locații validate (terenuri de fotbal, tenis, baschet, fitness etc.), fiecare cu detalii despre suprafață, iluminat și fotografii. Oricine poate crea activități la aceste locații, poate invita prieteni sau poate descoperi activități publice din zonă.

---

## Funcționalități

**Conturi și profile**
- Înregistrare cu confirmare prin email
- Autentificare JWT cu refresh token automat
- Profil cu poză, sporturi favorite și statistici
- Sistem de urmărire reciprocă între utilizatori (mutual follow)

**Harta și locații**
- Hartă interactivă cu toate locațiile sportive aprobate
- Filtrare după sport, suprafață, iluminat
- Fiecare locație cu galerie foto și detalii complete

**Activități**
- Creare activități la orice locație aprobată
- Activități publice (vizibile tuturor) sau private (vizibile doar prietenilor reciproci)
- Participare / retragere cu număr limitat de locuri
- Lista de activități arată doar evenimentele viitoare; cele trecute rămân în istoricul personal

**Profiluri și comunitate**
- Pagina de profil cu istoricul activităților organizate și la care ai participat
- Pagini de profil publice pentru alți utilizatori
- Sistem de prietenie cu follow/unfollow

**Administrare**
- Panou admin pentru gestionarea utilizatorilor și promovarea la rol de admin
- Locațiile propuse sunt validate de un admin înainte să apară pe hartă

---

## Tech Stack

### Backend
| | |
|---|---|
| Framework | ASP.NET Core 8 Web API |
| Limbaj | C# 12 / .NET 8 |
| Bază de date | Microsoft SQL Server |
| ORM | Entity Framework Core 8 |
| Autentificare | JWT Bearer + BCrypt (work factor 12) |
| Email | SMTP / SendGrid |
| Arhitectură | Clean Architecture (API → Infrastructure → Core → Models) |

### Frontend
| | |
|---|---|
| Framework | Angular 17+ (standalone components) |
| Limbaj | TypeScript |
| UI | Tailwind CSS + Material Symbols |
| State | Angular Signals |
| Hartă | Leaflet.js |
| HTTP | Angular HttpClient cu interceptor JWT auto-refresh |

---

## Arhitectură backend

```
SportMap.API          ← HTTP layer (Controllers, Middleware, Swagger)
      │
SportMap.Infrastructure  ← EF Core, Repositories, BCrypt, JWT, Email
      │
SportMap.Core         ← Business logic (Services, Entities, Interfaces)
      │
SportMap.Models       ← DTOs partajate între layere
```

`Core` nu referențiază niciodată `Infrastructure` sau `API`. Dependency inversion este asigurat prin interfețe înregistrate în DI la pornire.

---

## Cum rulezi proiectul local

### Prerequisite

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- Microsoft SQL Server (LocalDB / Express / Full)
- EF Core CLI: `dotnet tool install --global dotnet-ef`

### Backend

```bash
cd backend

# Configurare connection string
# Editează src/SportMap.API/appsettings.Development.json:
# "DefaultConnection": "Server=localhost;Database=SportMapDb;Trusted_Connection=True;TrustServerCertificate=True;"

# JWT Secret (nu comite în repo)
cd src/SportMap.API
dotnet user-secrets init
dotnet user-secrets set "Jwt:Secret" "$(openssl rand -base64 48)"

# Restore și rulare (migrările se aplică automat la pornire)
dotnet restore
dotnet run
```

API-ul pornește pe `http://localhost:5000`. Swagger UI disponibil la `http://localhost:5000/swagger`.

La prima pornire se creează automat un cont admin:
- Email: `admin@sportmap.local`
- Parolă: `Admin123!`

### Frontend

```bash
cd frontend
npm install
ng serve
```

Aplicația pornește pe `http://localhost:4200`.

---

## Migrări bază de date

```bash
# Creare migrare nouă
dotnet ef migrations add <NumeMigrare> \
  --project src/SportMap.Infrastructure \
  --startup-project src/SportMap.API

# Aplicare manuală
dotnet ef database update \
  --project src/SportMap.Infrastructure \
  --startup-project src/SportMap.API
```

---

## Git Workflow

Trunk-based development cu feature branches scurte.

```bash
git checkout main && git pull
git checkout -b feat/descriere-scurta
# commits
git push -u origin feat/descriere-scurta
# Pull Request → main
```

**Conventional Commits:**

```
feat(activities): add private activity support
fix(auth): prevent logout on 403 forbidden response
refactor(profile): unify sport photo logic via sport-utils
chore(deps): upgrade Angular to 17.3
```

Tipuri: `feat` · `fix` · `docs` · `refactor` · `perf` · `test` · `chore`

---

## Roadmap

Câteva direcții naturale de extindere a platformei:

- **Chat în timp real** — conversații între participanții unei activități, folosind SignalR
- **Notificări** — alertă când cineva se alătură activității tale, când un prieten creează un eveniment sau când o locație favorită are activitate nouă
- **Locații propuse de utilizatori** — posibilitatea ca orice utilizator să propună o locație nouă direct din aplicație, urmând să fie aprobată de un admin
- **Sistem de recenzii** — rating și comentarii pentru locații după participarea la o activitate
- **Aplicație mobilă** — client nativ (React Native sau Flutter) care folosește același API

---

## Licență

Proiect personal — toate drepturile rezervate.
