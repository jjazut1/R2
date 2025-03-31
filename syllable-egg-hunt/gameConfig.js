import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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
            }

            async saveConfiguration() {
                const config = {
                    title: document.getElementById('title').value,
                    email: document.getElementById('email').value,
                    eggQty: parseInt(document.getElementById('eggQty').value),
                    basketQty: parseInt(document.getElementById('basketQty').value),
                    share: document.getElementById('share').checked,
                    categoryType: document.getElementById('categoryType').value,
                    category: this.parseCategoryContent(),
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

            parseCategoryContent() {
                const content = document.getElementById('category').value;
                const type = document.getElementById('categoryType').value;

                try {
                    switch (type) {
                        case 'string':
                            return content;
                        case 'array':
                            return content.split('\n').map(item => item.trim()).filter(item => item);
                        case 'map':
                            const map = {};
                            content.split('\n').forEach(line => {
                                const [key, value] = line.split(':').map(item => item.trim());
                                if (key && value) map[key] = value;
                            });
                            return map;
                        default:
                            return content;
                    }
                } catch (error) {
                    console.error('Error parsing category content:', error);
                    return content;
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
                document.getElementById('categoryType').value = config.categoryType;
                
                // Format category content based on type
                let categoryContent = '';
                if (typeof config.category === 'object') {
                    if (Array.isArray(config.category)) {
                        categoryContent = config.category.join('\n');
                    } else {
                        categoryContent = Object.entries(config.category)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('\n');
                    }
                } else {
                    categoryContent = config.category;
                }
                document.getElementById('category').value = categoryContent;

                // Update the game with new configuration
                this.updateGame(config);
            }

            updateGame(config) {
                // Update game elements based on configuration
                // This will need to be implemented based on your game's specific needs
                // For example:
                updateEggs(config.eggQty);
                updateBaskets(config.basketQty);
                updateCategories(config.category);
            }
        }

        // Initialize the game configuration
        const gameConfig = new GameConfiguration();
    })
    .catch(error => {
        console.error('Error loading Firebase configuration:', error);
    });