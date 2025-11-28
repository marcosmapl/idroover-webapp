# idroove-webapp
ReactJS webapp for iDroove Company

This is a simple Vite + React starter for the iDroove dealership app. It includes an initial Login page and a main Dashboard with a top menu and unit selection (Manaus and Fortaleza).

## Getting started

Install dependencies:

```bash
npm install
```

If you want to use React-Bootstrap components and styling, install the new dependencies added to `package.json`:

```bash
npm install
```

Run in development:

```bash
npm run dev
```

Open http://localhost:5173 (default Vite port).

### Demo login

You can log in using any e-mail and password as the demo app stores a simple local user in the browser's localStorage. To logout, click the "Sair" button in the top menu.

## Backend API

This app supports fetching and updating Vehicles from a backend REST API.

- Default base url: `http://localhost:3333/api`
- Supported endpoints (assumed):
	- `GET /vehicles` — returns list of vehicles
	- `GET /vehicles/:id` — returns one vehicle
	- `POST /vehicles` — creates a new vehicle
	- `PUT /vehicles/:id` — updates a vehicle
	- `DELETE /vehicles/:id` — deletes a vehicle

If the backend is not reachable, the app will fallback to localStorage seeded data and local CRUD operations.

Note: The frontend maps unit names to codes for API calls: Manaus -> 1, Fortaleza -> 2. The API should use field `codigoUnidade` to indicate the unit for each vehicle.

React-Bootstrap
---------------
This project now includes Bootstrap + React-Bootstrap as dependencies. To use React-Bootstrap UI components, import them in your components like:

```jsx
import { Navbar, Container, Nav, Button } from 'react-bootstrap'
```

Bootstrap CSS is imported in `src/main.jsx` (via `import 'bootstrap/dist/css/bootstrap.min.css'`). After running `npm install`, React-Bootstrap components will follow Bootstrap styling.


