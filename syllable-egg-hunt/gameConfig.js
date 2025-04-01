import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { updateEggs, updateBaskets, updateCategories } from './game.js';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Fetch Firebase configuration from your API endpoint
fetch('/api/firebase-config')
    .then(response => response.json())
    .then(firebaseConfig => {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        
        class GameConfiguration {
            constructor() {
                this.setupEventListeners();
                this.checkAuthState();
                this.loadSavedConfigs();
            }

            checkAuthState() {
                auth.onAuthStateChanged(user => {
                    if (user) {
                        // User is signed in
                        document.getElementById('email').value = user.email;
                        document.getElementById('email').disabled = true;
                        this.loadSavedConfigs();
                        this.showAuthStatus(true, user.email);
                        // Enable configure button
                        this.setupConfigureButton();
                    } else {
                        // No user is signed in
                        this.showAuthStatus(false);
                        // Disable configure button or show login prompt
                        const configureBtn = document.getElementById('configureGame');
                        configureBtn.onclick = () => {
                            alert('Please login first to configure the game');
                            this.login();
                        };
                    }
                });
            }

            setupConfigureButton() {
                const configureBtn = document.getElementById('configureGame');
                configureBtn.onclick = () => {
                    const popup = document.getElementById('configPopup');
                    if (popup) {
                        popup.style.display = 'block';
                    } else {
                        console.error('Configure popup not found');
                    }
                };
            }

            showAuthStatus(isLoggedIn, email = '') {
                // Add this HTML to your page if not already present
                const authDiv = document.createElement('div');
                authDiv.id = 'authStatus';
                authDiv.className = 'auth-status';
                document.body.appendChild(authDiv);

                if (isLoggedIn) {
                    authDiv.innerHTML = `
                        <span>Logged in as: ${email}</span>
                        <button id="logoutBtn">Logout</button>
                    `;
                    document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
                } else {
                    authDiv.innerHTML = `
                        <button id="loginBtn">Login with Google</button>
                    `;
                    document.getElementById('loginBtn').addEventListener('click', () => this.login());
                }
            }

            async login() {
                try {
                    const result = await signInWithPopup(auth, provider);
                    console.log('Successfully logged in:', result.user.email);
                } catch (error) {
                    console.error('Login error:', error);
                    alert('Error logging in. Please try again.');
                }
            }

            async logout() {
                try {
                    await auth.signOut();
                    document.getElementById('email').value = '';
                    document.getElementById('email').disabled = false;
                } catch (error) {
                    console.error('Logout error:', error);
                }
            }

            setupEventListeners() {
                // Configure button initial setup
                const configureBtn = document.getElementById('configureGame');
                if (configureBtn) {
                    configureBtn.onclick = () => {
                        if (!auth.currentUser) {
                            alert('Please login first to configure the game');
                            this.login();
                            return;
                        }
                        const popup = document.getElementById('configPopup');
                        if (popup) {
                            popup.style.display = 'block';
                        }
                    };
                }

                // Close popup button
                const closeBtn = document.getElementById('closePopup');
                if (closeBtn) {
                    closeBtn.onclick = () => {
                        const popup = document.getElementById('configPopup');
                        if (popup) {
                            popup.style.display = 'none';
                        }
                    };
                }

                // Form submission
                document.getElementById('gameConfigForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    if (!auth.currentUser) {
                        alert('Please login first to save configuration');
                        return;
                    }
                    await this.saveConfiguration();
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
                if (!auth.currentUser) {
                    alert('Please login first to save configuration');
                    return;
                }

                const config = {
                    title: document.getElementById('title').value,
                    email: auth.currentUser.email, // Use authenticated user's email
                    eggQty: parseInt(document.getElementById('eggQty').value),
                    basketQty: parseInt(document.getElementById('basketQty').value),
                    share: document.getElementById('share').checked,
                    categories: [],
                    createdAt: new Date()
                };

                // Get all category groups
                const categoryGroups = document.querySelectorAll('.category-group');
                categoryGroups.forEach((group, index) => {
                    const categoryName = document.getElementById(`categoryName${index}`).value;
                    const categoryItems = document.getElementById(`categoryItems${index}`)
                        .value
                        .split(',')
                        .map(item => item.trim())
                        .filter(item => item.length > 0);

                    config.categories.push({
                        name: categoryName,
                        items: categoryItems
                    });
                });

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
                        
                        // If this is a shared configuration and not owned by current user
                        if (data.share && data.email !== auth.currentUser?.email) {
                            // Create a new configuration based on the shared one
                            const newConfig = {
                                ...data,
                                title: `Copy of ${data.title}`,
                                email: auth.currentUser?.email || '',
                                createdAt: new Date()
                            };

                            // Save as a new configuration
                            const docRef = await addDoc(collection(db, 'sortCategoriesEgg'), newConfig);
                            alert('Created a copy of the shared configuration');
                            return docRef.id;
                        } else {
                            // Regular load of own configuration
                            this.applyConfiguration(data);
                        }
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