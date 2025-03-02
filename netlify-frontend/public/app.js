// API Configuration
const API_URL = 'https://mood-recipes-backend.onrender.com';

let currentMood = '';
let currentRecipe = null;
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');

// DOM Elements
const moodButtons = document.querySelectorAll('.mood-btn');
const recipeContainer = document.getElementById('recipe-container');
const recipeName = document.getElementById('recipe-name');
const recipeImage = document.getElementById('recipe-image');
const recipeIngredients = document.getElementById('recipe-ingredients');
const recipeInstructions = document.getElementById('recipe-instructions');
const recipeTime = document.getElementById('recipe-time');
const recipeDifficulty = document.getElementById('recipe-difficulty');
const recipeCalories = document.getElementById('recipe-calories');
const recipeRating = document.getElementById('recipe-rating');
const protein = document.getElementById('protein');
const carbs = document.getElementById('carbs');
const fat = document.getElementById('fat');
const newRecipeBtn = document.getElementById('new-recipe-btn');
const saveRecipeBtn = document.getElementById('save-recipe-btn');
const shoppingListBtn = document.getElementById('shopping-list-btn');
const loadingElement = document.getElementById('loading');
const moodBadge = document.getElementById('mood-badge');
const loginBtn = document.getElementById('login-btn');
const savedRecipesBtn = document.getElementById('saved-recipes-btn');
const dietaryPrefs = document.getElementById('dietary-prefs');
const cuisineType = document.getElementById('cuisine-type');
const maxTime = document.getElementById('max-time');

// User preferences
const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
if (userPreferences.dietary_prefs) dietaryPrefs.value = userPreferences.dietary_prefs;
if (userPreferences.cuisine_type) cuisineType.value = userPreferences.cuisine_type;
if (userPreferences.max_time) maxTime.value = userPreferences.max_time;

// Audio players for different moods
let currentAudio = null;

const moodMusic = {
    happy: {
        title: "I and Love and You - The Avett Brothers",
        url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3"  // Happy acoustic guitar
    },
    stressed: {
        title: "Stairway to Heaven - Led Zeppelin",
        url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3"  // Calming piano
    }
};

function playMoodMusic(mood) {
    // Stop any currently playing music
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    // Only play for happy and stressed moods
    if (!moodMusic[mood]) return;

    // Create and play new audio
    currentAudio = new Audio(moodMusic[mood].url);
    currentAudio.volume = 0.3; // Set volume to 30%
    
    // Add music info to the UI
    const musicInfo = document.createElement('div');
    musicInfo.className = 'fixed bottom-4 right-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full flex items-center space-x-2';
    musicInfo.innerHTML = `
        <i class="fas fa-music"></i>
        <span>${moodMusic[mood].title}</span>
        <button class="ml-2 hover:text-gray-300" onclick="toggleMusic()">
            <i class="fas fa-pause" id="music-toggle-icon"></i>
        </button>
        <div class="ml-2">
            <input type="range" min="0" max="100" value="30" 
                class="w-16 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                onchange="adjustVolume(this.value)"
            >
        </div>
    `;
    
    // Remove any existing music info
    const existingMusicInfo = document.querySelector('.fixed.bottom-4.right-4');
    if (existingMusicInfo) {
        existingMusicInfo.remove();
    }
    
    document.body.appendChild(musicInfo);
    
    // Play the music with error handling
    currentAudio.play().catch(error => {
        console.error('Error playing audio:', error);
        // Show error message to user
        const errorMsg = document.createElement('div');
        errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg';
        errorMsg.textContent = 'Unable to play music. Please check your audio settings and try again.';
        document.body.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 5000);
    });

    // Add loading indicator
    currentAudio.addEventListener('waiting', () => {
        const icon = document.getElementById('music-toggle-icon');
        if (icon) icon.className = 'fas fa-spinner fa-spin';
    });

    // Remove loading indicator when can play
    currentAudio.addEventListener('canplay', () => {
        const icon = document.getElementById('music-toggle-icon');
        if (icon) icon.className = 'fas fa-pause';
    });

    // Handle audio ended
    currentAudio.addEventListener('ended', () => {
        const icon = document.getElementById('music-toggle-icon');
        if (icon) icon.className = 'fas fa-play';
    });
}

// Function to toggle music play/pause
window.toggleMusic = function() {
    if (!currentAudio) return;
    
    const icon = document.getElementById('music-toggle-icon');
    if (currentAudio.paused) {
        currentAudio.play()
            .then(() => {
                icon.className = 'fas fa-pause';
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                icon.className = 'fas fa-exclamation-triangle';
            });
    } else {
        currentAudio.pause();
        icon.className = 'fas fa-play';
    }
};

// Function to adjust volume
window.adjustVolume = function(value) {
    if (currentAudio) {
        currentAudio.volume = value / 100;
    }
};

// Function to show loading state
function showLoading() {
    loadingElement.classList.remove('hidden');
    recipeContainer.classList.add('hidden');
}

// Function to hide loading state
function hideLoading() {
    loadingElement.classList.add('hidden');
    recipeContainer.classList.remove('hidden');
}

// Function to format ingredients as list items
function formatIngredients(ingredients) {
    return ingredients.split(',').map(ingredient => 
        `<li>${ingredient.trim()}</li>`
    ).join('');
}

// Function to format instructions as list items
function formatInstructions(instructions) {
    return instructions.split('\n').map(instruction => 
        `<li>${instruction.replace(/^\d+\.\s*/, '')}</li>`
    ).join('');
}

// Function to set mood badge style
function setMoodBadge(mood) {
    const moodStyles = {
        happy: 'bg-yellow-100 text-yellow-800',
        sad: 'bg-blue-100 text-blue-800',
        excited: 'bg-red-100 text-red-800',
        stressed: 'bg-purple-100 text-purple-800'
    };
    
    moodBadge.className = `px-3 py-1 rounded-full text-sm font-medium ${moodStyles[mood]}`;
    moodBadge.textContent = mood.charAt(0).toUpperCase() + mood.slice(1);
}

// Function to fetch a recipe
async function fetchRecipe(mood) {
    showLoading();
    try {
        const dietaryRestrictions = document.getElementById('dietary-restrictions').value;
        const cuisineType = document.getElementById('cuisine-type').value;
        const maxTime = document.getElementById('max-time').value;

        let url = `${API_URL}/api/recipe/${mood}`;
        
        // Add query parameters if they exist
        const params = new URLSearchParams();
        if (dietaryRestrictions) params.append('dietary_restrictions', dietaryRestrictions);
        if (cuisineType) params.append('cuisine_type', cuisineType);
        if (maxTime) params.append('max_time', maxTime);
        
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch recipe');
        }
        const recipe = await response.json();
        displayRecipe(recipe);
        playMoodMusic(mood);
    } catch (error) {
        console.error('Error:', error);
        recipeContainer.innerHTML = '<p class="error">Failed to load recipe. Please try again.</p>';
    } finally {
        hideLoading();
    }
}

// Function to display a recipe
function displayRecipe(recipe) {
    if (!recipe) {
        recipeName.textContent = 'No recipe found for this mood';
        recipeContainer.classList.add('hidden');
        return;
    }

    // Basic info
    recipeName.textContent = recipe.name;
    recipeImage.src = recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
    recipeIngredients.innerHTML = formatIngredients(recipe.ingredients);
    recipeInstructions.innerHTML = formatInstructions(recipe.instructions);
    setMoodBadge(recipe.mood);
    
    // Meta info
    recipeTime.textContent = `${recipe.total_time || recipe.prep_time}`;
    recipeDifficulty.textContent = recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1);
    recipeCalories.textContent = `${recipe.calories} cal`;
    
    // Nutrition info
    protein.textContent = `${recipe.protein}g`;
    carbs.textContent = `${recipe.carbs}g`;
    fat.textContent = `${recipe.fat}g`;
    
    // Rating
    recipeRating.innerHTML = `
        <i class="fas fa-star"></i>
        <span class="text-gray-600">${recipe.rating} (${recipe.review_count})</span>
    `;
    
    // Update save button state
    const isRecipeSaved = savedRecipes.some(saved => saved.name === recipe.name);
    updateSaveButtonState(isRecipeSaved);
    
    recipeContainer.classList.remove('hidden');
}

// Function to update save button state
function updateSaveButtonState(isSaved) {
    if (isSaved) {
        saveRecipeBtn.innerHTML = '<i class="fas fa-bookmark mr-2"></i>Saved';
        saveRecipeBtn.classList.remove('bg-gray-100', 'hover:bg-gray-200');
        saveRecipeBtn.classList.add('bg-green-100', 'text-green-800');
    } else {
        saveRecipeBtn.innerHTML = '<i class="far fa-bookmark mr-2"></i>Save Recipe';
        saveRecipeBtn.classList.remove('bg-green-100', 'text-green-800');
        saveRecipeBtn.classList.add('bg-gray-100', 'hover:bg-gray-200');
    }
}

// Function to save user preferences
function saveUserPreferences() {
    const preferences = {
        dietary_prefs: dietaryPrefs.value,
        cuisine_type: cuisineType.value,
        max_time: maxTime.value
    };
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

// Function to handle shopping list
async function handleShoppingList() {
    if (!currentRecipe) return;
    
    try {
        const response = await fetch(`${API_URL}/api/recipes/${currentRecipe.id}/shopping-list`);
        if (!response.ok) {
            throw new Error('Failed to fetch shopping list');
        }
        const shoppingList = await response.json();
        
        // Display shopping list in a modal or new section
        const listHtml = shoppingList.map(item => 
            `<li>${item.item} - ${item.amount} (Est. ${item.estimated_price})</li>`
        ).join('');
        
        document.getElementById('shopping-list').innerHTML = `
            <h3>Shopping List</h3>
            <ul>${listHtml}</ul>
        `;
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load shopping list');
    }
}

// Event Listeners
moodButtons.forEach(button => {
    button.addEventListener('click', async () => {
        currentMood = button.dataset.mood;
        
        // Reset active state for all buttons
        moodButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Set active state for clicked button
        button.classList.add('active');
        
        // Play mood-specific music
        playMoodMusic(currentMood);
        
        const recipe = await fetchRecipe(currentMood);
        displayRecipe(recipe);
    });
});

newRecipeBtn.addEventListener('click', async () => {
    if (currentMood) {
        const recipe = await fetchRecipe(currentMood);
        displayRecipe(recipe);
    }
});

saveRecipeBtn.addEventListener('click', async () => {
    if (!currentRecipe) return;
    
    const recipeIndex = savedRecipes.findIndex(recipe => recipe.name === currentRecipe.name);
    
    if (recipeIndex === -1) {
        // Save recipe
        savedRecipes.push(currentRecipe);
        updateSaveButtonState(true);
        
        // Save to server if user is logged in
        if (currentUser) {
            try {
                await fetch(`${API_URL}/api/recipes/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: currentUser.id,
                        recipe_id: currentRecipe.id,
                        collection_name: 'Favorites'
                    })
                });
            } catch (error) {
                console.error('Error saving recipe:', error);
            }
        }
    } else {
        // Unsave recipe
        savedRecipes.splice(recipeIndex, 1);
        updateSaveButtonState(false);
    }
    
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
});

shoppingListBtn.addEventListener('click', handleShoppingList);

// Preference change handlers
dietaryPrefs.addEventListener('change', saveUserPreferences);
cuisineType.addEventListener('change', saveUserPreferences);
maxTime.addEventListener('change', saveUserPreferences); 