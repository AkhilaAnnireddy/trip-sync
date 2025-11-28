# TripSync - Frontend 🌍✈️

A collaborative trip planning application built with React, Vite, and Tailwind CSS.

## 🛠️ Tech Stack

- **React 18.x** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Mapbox GL JS** - Interactive maps

## 📦 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**


**Get Your Mapbox Token:**
1. Sign up at [Mapbox](https://www.mapbox.com/)
2. Go to Account → Tokens
3. Copy your default public token

### 2. Configure Vite Proxy

The `vite.config.js` is already configured to proxy API requests to `http://localhost:8080`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

## 🏃 Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

Or with yarn:
```bash
yarn dev
```

The application will start on **http://localhost:5173**





**Happy Coding! - Shraddha 🎉**