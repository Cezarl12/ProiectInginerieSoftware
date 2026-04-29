# SportMap API — Specification

Base URL: `https://localhost:5001/api`  
Auth: Bearer JWT (obținut de la `POST /api/auth/login`)

---

## Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ✗ | Înregistrare cont nou; trimite email de confirmare |
| POST | `/auth/confirm-email` | ✗ | Confirmă emailul cu tokenul primit |
| POST | `/auth/login` | ✗ | Autentificare; returnează JWT + refresh token |
| POST | `/auth/refresh` | ✗ | Reînnoiește JWT cu refresh token |
| POST | `/auth/logout` | ✓ | Revocă refresh token-ul curent |

---

## Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | ✓ | Lista tuturor utilizatorilor |
| GET | `/users/{id}` | ✓ | Profil public utilizator |
| GET | `/users/me` | ✓ | Profilul utilizatorului autentificat |
| PUT | `/users/me` | ✓ | Actualizare profil (username, foto, sporturi favorite) |
| POST | `/users/me/change-password` | ✓ | Schimbare parolă |
| DELETE | `/users/me` | ✓ | Ștergere cont |
| GET | `/users/{id}/activities` | ✓ | Activitățile organizate de utilizator |

---

## Activities

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/activities` | ✓ | Lista activităților cu filtre opționale |
| GET | `/activities/{id}` | ✓ | Detalii activitate (cu Organizer și Location) |
| GET | `/activities/me/organized` | ✓ | Activitățile create de utilizatorul curent |
| GET | `/activities/me/joined` | ✓ | Activitățile la care participă utilizatorul curent |
| POST | `/activities` | ✓ | Creare activitate nouă |
| PUT | `/activities/{id}` | ✓ | Actualizare activitate (doar organizator) |
| DELETE | `/activities/{id}` | ✓ | Ștergere activitate (doar organizator) |

### Filtre GET /activities (query params)

| Param | Tip | Descriere |
|-------|-----|-----------|
| `sport` | string | Filtrare parțială după sport (case-insensitive) |
| `type` | int | `0` = Public, `1` = Private |
| `fromDate` | datetime | Activități de la această dată |
| `toDate` | datetime | Activități până la această dată |
| `locationId` | int | Filtrare după locație |

### Validări POST /activities

- `DateTime` trebuie să fie în viitor
- `MaxParticipants` între 1 și 100
- `LocationId` trebuie să existe și să aibă `Status = Approved`
- `OrganizerId` setat automat din JWT

---

## Locații seed (Oradea)

| ID | Nume | Sport principal |
|----|------|-----------------|
| 1 | Stadionul Municipal Iuliu Bodola | fotbal |
| 2 | Baza Olimpică de Natație Oradea | înot |
| 3 | Pista de Ciclism Parcul Brătianu | ciclism |
| 4 | Complexul de Tenis Lotus | tenis |
| 5 | XT Gold Arena | baschet |
| 6 | Sala de Sport a Universității | volei |
| 7 | Pista de Atletism Iuliu Bodola | atletism |
| 8 | Sala Sporturilor Oradea | handbal |
| 9 | Centrul Fitness SportMap Park | fitness |
| 10 | Sala de Box Crișul | box |

Toate locațiile au `Status = Approved` și pot fi folosite imediat la crearea activităților.

---

## Error responses

| Status | Tip | Când apare |
|--------|-----|-----------|
| 400 | Bad Request | Date invalide (validare) |
| 401 | Unauthorized | Lipsă JWT sau credențiale greșite |
| 403 | Forbidden | Autentificat dar fără permisiune |
| 404 | Not Found | Resursă inexistentă |
| 409 | Conflict | Email/username deja folosit |
| 500 | Internal Server Error | Eroare neașteptată |
