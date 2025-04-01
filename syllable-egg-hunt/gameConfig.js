import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { updateEggs, updateBaskets, updateCategories } from './game.js';

// Fetch Firebase configuration from your API endpoint
fetch('/api/firebase-config')
    .then(response => response.json())
    .then(firebaseConfig => {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        class GameConfiguration {
            constructor() {
                this.setupEventListeners();
                this.loadSavedConfigs();
            }

            setupEventListeners() {
                // Open popup
                document.getElementById('configureGame').addEventListener('click', () => {
                    document.getElementById('configPopup').style.display = 'block';
                });

                // Close popup
                document.getElementById('closePopup').addEventListener('click', () => {
                    document.getElementById('configPopup').style.display = 'none';
                });

                // Form submission
                document.getElementById('gameConfigForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.saveConfiguration();
                });

                // Load configuration
                document.getElementById('configSelect').addEventListener('change', (e) => {
                    if (e.target.value) {
                        this.loadConfiguration(e.target.value);
                    }
                });

                // Category type change handler
                document.getElementById('categoryType').addEventListener('change', (e) => {
                    this.updateCategoryHelp(e.target.value);
                });

                // Add basket quantity change handler with validation
                const basketQtyInput = document.getElementById('basketQty');
                if (basketQtyInput) {
                    basketQtyInput.addEventListener('change', (e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0) {
                            this.updateCategoryFields(value);
                        } else {
                            e.target.value = 1; // Reset to minimum value
                            this.updateCategoryFields(1);
                        }
                    });
                }
            }

            updateCategoryFields(basketQty) {
                const categoryContainer = document.getElementById('dynamicCategories');
                if (!categoryContainer) {
                    console.error('Dynamic categories container not found');
                    return;
                }

                categoryContainer.innerHTML = ''; // Clear existing fields

                // Create fields for each basket
                for (let i = 0; i < basketQty; i++) {
                    const categoryGroup = document.createElement('div');
                    categoryGroup.className = 'category-group';
                    categoryGroup.innerHTML = `
                        <div class="form-group">
                            <label for="categoryName${i}">Category ${i + 1} Name:</label>
                            <input type="text" id="categoryName${i}" class="category-input" required>
                        </div>
                        <div class="form-group">
                            <label for="categoryItems${i}">Items for Category ${i + 1}:</label>
                            <textarea id="categoryItems${i}" class="category-items" required></textarea>
                            <small>Enter items separated by new lines</small>
                        </div>
                    `;
                    categoryContainer.appendChild(categoryGroup);
                }
            }

            async saveConfiguration() {
                const basketQty = parseInt(document.getElementById('basketQty').value);
                const categories = [];

                // Collect data from dynamic category fields
                for (let i = 0; i < basketQty; i++) {
                    categories.push({
                        name: document.getElementById(`categoryName${i}`).value,
                        items: document.getElementById(`categoryItems${i}`).value
                            .split('\n')
                            .map(item => item.trim())
                            .filter(item => item)
                    });
                }

                const config = {
                    title: document.getElementById('title').value,
                    email: document.getElementById('email').value,
                    eggQty: parseInt(document.getElementById('eggQty').value),
                    basketQty: basketQty,
                    share: document.getElementById('share').checked,
                    categories: categories,
                    createdAt: new Date(),
                };

                try {
                    await addDoc(collection(db, 'sortCategoriesEgg'), config);
                    alert('Configuration saved successfully!');
                    this.loadSavedConfigs();
                } catch (error) {
                    console.error('Error saving configuration:', error);
                    alert('Error saving configuration');
                }
            }

            async loadSavedConfigs() {
                const select = document.getElementById('configSelect');
                select.innerHTML = '<option value="">Select a configuration...</option>';

                try {
                    const q = query(
                        collection(db, 'sortCategoriesEgg'),
                        where('share', '==', true)
                    );
                    const querySnapshot = await getDocs(q);
                    
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        const option = document.createElement('option');
                        option.value = doc.id;
                        option.textContent = `${data.title} (by ${data.email})`;
                        select.appendChild(option);
                    });
                } catch (error) {
                    console.error('Error loading configurations:', error);
                }
            }

            async loadConfiguration(configId) {
                try {
                    const docRef = doc(db, 'sortCategoriesEgg', configId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        this.applyConfiguration(data);
                    }
                } catch (error) {
                    console.error('Error loading configuration:', error);
                }
            }

            applyConfiguration(config) {
                document.getElementById('title').value = config.title;
                document.getElementById('email').value = config.email;
                document.getElementById('eggQty').value = config.eggQty;
                document.getElementById('basketQty').value = config.basketQty;
                document.getElementById('share').checked = config.share;

                // Update category fields
                this.updateCategoryFields(config.basketQty);

                // Fill in category data
                config.categories.forEach((category, index) => {
                    document.getElementById(`categoryName${index}`).value = category.name;
                    document.getElementById(`categoryItems${index}`).value = category.items.join('\n');
                });

                // Update the game with new configuration
                this.updateGame(config);
            }

            updateGame(config) {
                // Now these functions will be defined
                updateEggs(config.eggQty);
                updateBaskets(config.basketQty);
                updateCategories(config.categories);
            }
        }

        // Initialize the game configuration
        const gameConfig = new GameConfiguration();
    })
    .catch(error => {
        console.error('Error loading Firebase configuration:', error);
    });