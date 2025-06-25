# To-Do List App

This is a To-Do List application with user authentication.  
It uses **Node.js/Express/MongoDB** for the backend and **HTML/CSS/JS** for the frontend.

---

## Prasības

- Node.js (v16+)
- MongoDB Atlas vai lokāls MongoDB serveris

---

## Uzstādīšana

### 1. Klonē šo repozitoriju vai ielādē failus

### 2. Backend uzstādīšana

```bash
cd back_end
npm install
```

### 3. Izveido `.env` failu mapē `back_end` (ja nav jau)

```env
MONGO_URI=... # Tava MongoDB savienojuma virkne
JWT_SECRET=... # Ģenerē jebkādu slepenu frāzi
```

### 4. Palaid backend serveri

```bash
npm start
```
Serveris darbosies uz http://localhost:3000

---

### 5. Frontend uzstādīšana

Nav nepieciešama īpaša uzstādīšana.  
Vienkārši atver `front_end/index.html` ar pārlūkprogrammu.

---

## Lietošana

1. Atver `front_end/index.html` ar pārlūkprogrammu.
2. Reģistrējies vai pieslēdzies.
3. Veido, labo, dzēs uzdevumus, pievieno komentārus, koplieto uzdevumus ar citiem lietotājiem.
4. Vēsture (TaskHistory) tiek glabāta MongoDB kolekcijā `taskhistories`.

---

## API pārskats

- `POST /auth/signup` — reģistrācija
- `POST /auth/login` — pieslēgšanās
- `GET /tasks` — iegūt uzdevumus
- `POST /tasks` — pievienot uzdevumu
- `PUT /tasks/:id` — labot uzdevumu (arī statusu)
- `DELETE /tasks/:id` — dzēst uzdevumu
- `POST /tasks/:id/comments` — pievienot komentāru
- `GET /tasks/:id/comments` — iegūt komentārus
- `POST /tasks/:id/share` — koplietošana
- `GET /tasks/:id/history` — uzdevuma vēsture (audit log)

---

## Piezīmes

- Visi dati tiek glabāti MongoDB.
- Lietotāju paroles tiek šifrētas.
- TaskHistory kolekcija satur visus nozīmīgos notikumus (pievienošana, labošana, dzēšana, komentāri).

---

## Problēmu novēršana

- Ja neredzi uzdevumus vai saņem 401 kļūdu, pārliecinies, ka esi pieslēdzies un JWT tokens ir spēkā.
- Ja maini `.env`, pārlādē backend serveri.

---

Izstrādāts ar Node.js, Express, MongoDB un Vanilla JS.
