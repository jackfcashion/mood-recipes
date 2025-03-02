# Mood Recipes

A mood-based recipe recommendation app that suggests recipes based on how you're feeling. Features include:
- Recipe recommendations based on your current mood
- Mood-specific background music
- Dietary preferences and restrictions
- Shopping list generation
- Recipe saving functionality

## Features
- 🎵 Happy mood plays Avett Brothers
- 🎸 Stressed mood plays Led Zeppelin
- 🍳 Customizable recipe recommendations
- 🥗 Dietary preference filtering
- 📝 Shopping list generation
- ⭐ Recipe ratings and reviews
- 💾 Save favorite recipes

## Tech Stack
- Frontend: HTML, CSS (Tailwind), JavaScript
- Backend: Node.js, Express
- Database: SQLite
- Deployment: Netlify (frontend), Render (backend)

## Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mood-recipes
```

2. Install dependencies:
```bash
# Install backend dependencies
cd src
npm install

# Install frontend dependencies (if any)
cd ../netlify-frontend
npm install
```

3. Start the backend server:
```bash
cd src
node server.js
```

4. Open `netlify-frontend/public/index.html` in your browser

## Environment Setup
Make sure you have Node.js version 14 or higher installed.

## Deployment
- Frontend is deployed on Netlify
- Backend is deployed on Render

## API Endpoints
- `GET /api/recipe/:mood` - Get a recipe based on mood
- `GET /api/recipes/:recipeId/shopping-list` - Get shopping list for a recipe
- `POST /api/recipes/save` - Save a recipe to favorites

## Contributing
Feel free to submit issues and enhancement requests! 