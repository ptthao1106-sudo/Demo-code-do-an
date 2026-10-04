# Rebuilt UI demo — coded from the supplied reference images

This version does NOT use the supplied full-screen reference screenshots as UI backgrounds or clickable hotspots.

## Implemented screens
- `/` — coded public search/map screen using React + Leaflet
- `/detail/:id` — coded utility detail screen
- `/route/:id` — coded directions screen
- `/admin/login` — coded administrator login form
- `/admin` — coded administrator utility management screen
- Sidebar "Quản lý loại tiện ích" — coded type-management screen

## Assets
Only supporting imagery such as `login-city.png` and `park-demo.jpg` is used. The six full reference screenshots were removed from `client/public/assets`.

## Run
```powershell
npm install
npm run dev
```

Open `http://localhost:5000/`.

Demo admin credentials:
- username: `admin`
- password: `Admin@123`

If the backend is unavailable, the login page accepts those demo credentials locally so the UI can still be demonstrated.
