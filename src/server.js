const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const dbPath = path.join(__dirname, '..', 'database', 'recipes.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to the SQLite database');
    
    // Create tables and insert sample data
    initializeDatabase();
});

// Initialize database with tables and sample data
function initializeDatabase() {
    db.serialize(() => {
        // Create tables
        db.run(`CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            mood TEXT,
            ingredients TEXT,
            instructions TEXT,
            prep_time INTEGER,
            cook_time INTEGER,
            total_time INTEGER,
            difficulty TEXT,
            calories INTEGER,
            protein REAL,
            carbs REAL,
            fat REAL,
            rating REAL,
            review_count INTEGER,
            image_url TEXT,
            dietary_tags TEXT,
            cuisine_type TEXT
        )`);

        // Check if we already have recipes
        db.get("SELECT COUNT(*) as count FROM recipes", [], (err, row) => {
            if (err) {
                console.error('Error checking recipes:', err);
                return;
            }

            if (row.count === 0) {
                // Insert sample recipes
                const sampleRecipes = [
                    {
                        name: "Comforting Mac and Cheese",
                        mood: "sad",
                        ingredients: "macaroni, cheddar cheese, milk, butter, flour, breadcrumbs, salt, pepper",
                        instructions: "1. Cook macaroni according to package instructions\n2. Make cheese sauce with butter, flour, and milk\n3. Add cheese and stir until melted\n4. Combine with macaroni\n5. Top with breadcrumbs and bake",
                        prep_time: 15,
                        cook_time: 25,
                        total_time: 40,
                        difficulty: "easy",
                        calories: 450,
                        protein: 18,
                        carbs: 47,
                        fat: 22,
                        rating: 4.8,
                        review_count: 245,
                        image_url: "https://images.unsplash.com/photo-1543352634-99a5d50ae78e",
                        dietary_tags: "vegetarian",
                        cuisine_type: "american"
                    },
                    {
                        name: "Energizing Breakfast Bowl",
                        mood: "happy",
                        ingredients: "quinoa, banana, berries, almond milk, honey, chia seeds, almonds",
                        instructions: "1. Cook quinoa in almond milk\n2. Top with sliced banana and berries\n3. Drizzle with honey\n4. Sprinkle chia seeds and almonds",
                        prep_time: 10,
                        cook_time: 15,
                        total_time: 25,
                        difficulty: "easy",
                        calories: 380,
                        protein: 12,
                        carbs: 68,
                        fat: 9,
                        rating: 4.6,
                        review_count: 189,
                        image_url: "https://images.unsplash.com/photo-1551411839-9e3d3b77d339",
                        dietary_tags: "vegan",
                        cuisine_type: "healthy"
                    },
                    {
                        name: "Spicy Chicken Tacos",
                        mood: "excited",
                        ingredients: "chicken breast, tortillas, lime, cilantro, onion, jalapeños, spices",
                        instructions: "1. Season chicken with spices\n2. Grill until cooked through\n3. Warm tortillas\n4. Assemble tacos with toppings",
                        prep_time: 20,
                        cook_time: 15,
                        total_time: 35,
                        difficulty: "medium",
                        calories: 420,
                        protein: 28,
                        carbs: 35,
                        fat: 18,
                        rating: 4.7,
                        review_count: 312,
                        image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b",
                        dietary_tags: "",
                        cuisine_type: "mexican"
                    },
                    {
                        name: "Calming Chamomile Lavender Cookies",
                        mood: "stressed",
                        ingredients: "flour, butter, sugar, egg, chamomile tea, dried lavender, vanilla",
                        instructions: "1. Cream butter and sugar\n2. Add egg and vanilla\n3. Mix in dry ingredients\n4. Shape and bake",
                        prep_time: 25,
                        cook_time: 12,
                        total_time: 37,
                        difficulty: "medium",
                        calories: 120,
                        protein: 2,
                        carbs: 18,
                        fat: 5,
                        rating: 4.5,
                        review_count: 156,
                        image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35",
                        dietary_tags: "vegetarian",
                        cuisine_type: "dessert"
                    },
                    {
                        name: "Smitten Kitchen's Brown Butter Rice Krispies",
                        mood: "happy",
                        ingredients: "butter, marshmallows, Rice Krispies cereal, vanilla extract, sea salt",
                        instructions: "1. Brown butter in a large pot\n2. Add marshmallows and stir until melted\n3. Add vanilla and salt\n4. Fold in cereal\n5. Press into pan and let cool",
                        prep_time: 15,
                        cook_time: 10,
                        total_time: 25,
                        difficulty: "easy",
                        calories: 180,
                        protein: 1,
                        carbs: 28,
                        fat: 8,
                        rating: 4.9,
                        review_count: 423,
                        image_url: "https://images.unsplash.com/photo-1519869491916-8ca6f615d6bd",
                        dietary_tags: "vegetarian",
                        cuisine_type: "dessert"
                    }
                ];

                const insertRecipe = db.prepare(`
                    INSERT INTO recipes (
                        name, mood, ingredients, instructions, prep_time, cook_time, total_time,
                        difficulty, calories, protein, carbs, fat, rating, review_count,
                        image_url, dietary_tags, cuisine_type
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                sampleRecipes.forEach(recipe => {
                    insertRecipe.run([
                        recipe.name, recipe.mood, recipe.ingredients, recipe.instructions,
                        recipe.prep_time, recipe.cook_time, recipe.total_time, recipe.difficulty,
                        recipe.calories, recipe.protein, recipe.carbs, recipe.fat,
                        recipe.rating, recipe.review_count, recipe.image_url,
                        recipe.dietary_tags, recipe.cuisine_type
                    ]);
                });

                insertRecipe.finalize();
                console.log('Sample recipes inserted successfully');
            }

            // Log total number of recipes
            db.get("SELECT COUNT(*) as count FROM recipes", [], (err, row) => {
                if (!err) {
                    console.log(`Total recipes in database: ${row.count}`);
                }
            });
        });
    });
}

// API Routes
app.get('/api/recipe/:mood', (req, res) => {
    const { mood } = req.params;
    const { dietary_restrictions, cuisine_type, max_time } = req.query;

    let query = 'SELECT * FROM recipes WHERE mood = ?';
    const params = [mood];

    if (dietary_restrictions) {
        query += ' AND dietary_tags LIKE ?';
        params.push(`%${dietary_restrictions}%`);
    }

    if (cuisine_type) {
        query += ' AND cuisine_type = ?';
        params.push(cuisine_type);
    }

    if (max_time) {
        query += ' AND total_time <= ?';
        params.push(parseInt(max_time));
    }

    query += ' ORDER BY RANDOM() LIMIT 1';

    db.get(query, params, (err, recipe) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error fetching recipe' });
            return;
        }
        if (!recipe) {
            res.status(404).json({ error: 'No recipe found for this mood' });
            return;
        }
        res.json(recipe);
    });
});

// Shopping list endpoint
app.get('/api/recipes/:recipeId/shopping-list', (req, res) => {
    const { recipeId } = req.params;
    
    db.get('SELECT ingredients FROM recipes WHERE id = ?', [recipeId], (err, recipe) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching ingredients' });
            return;
        }
        if (!recipe) {
            res.status(404).json({ error: 'Recipe not found' });
            return;
        }

        // Convert ingredients string to shopping list format
        const shoppingList = recipe.ingredients.split(',').map(item => ({
            item: item.trim(),
            amount: '1 unit', // You could enhance this with actual amounts
            estimated_price: '$2-4' // You could add real price estimates
        }));

        res.json(shoppingList);
    });
});

// Save recipe endpoint
app.post('/api/recipes/save', (req, res) => {
    const { user_id, recipe_id, collection_name } = req.body;
    // In a real app, you would save this to a user_recipes table
    res.json({ message: 'Recipe saved successfully' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 