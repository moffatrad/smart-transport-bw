// Smart Transport BW - Common JavaScript Functions

// Global Variables
let currentUser = null;
let currentDashboard = 'passenger'; // passenger or driver
let activeNav = 'home';
let sosPressTimer = null;
let sosPressed = false;
const liveMapState = {
    map: null,
    marker: null,
    polyline: null,
    watchId: null,
    path: []
};

// DOM Elements
const app = document.getElementById('app');
const sideDrawer = document.getElementById('sideDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const toast = document.getElementById('toast');

// ============ UI Helper Functions ============

function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function toggleDrawer() {
    sideDrawer.classList.toggle('open');
    drawerOverlay.classList.toggle('show');
}

function closeDrawer() {
    sideDrawer.classList.remove('open');
    drawerOverlay.classList.remove('show');
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }
}

function hideLoading(elementId) {
    // Loading will be replaced by actual content
}

function getStoredUsers() {
    return JSON.parse(localStorage.getItem('smartTransportUsers') || '[]');
}

function saveStoredUsers(users) {
    localStorage.setItem('smartTransportUsers', JSON.stringify(users));
}

function isValidEmail(email) {
    return email.includes('@') && email.indexOf('@') > 0 && email.indexOf('@') < email.length - 1;
}

function isValidPhone(phone) {
    const normalized = phone.replace(/[^0-9+]/g, '');
    return /^7\d{7}$/.test(normalized) || /^\+2677\d{7}$/.test(normalized) || /^2677\d{7}$/.test(normalized);
}

function switchAuthTab(tab) {
    document.getElementById('loginTabBtn').classList.toggle('active', tab === 'login');
    document.getElementById('registerTabBtn').classList.toggle('active', tab === 'register');
    document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
    document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
    document.getElementById('resetForm').classList.toggle('hidden', tab !== 'reset');
}

function showAuthScreen() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('passengerDashboard').classList.add('hidden');
    document.getElementById('driverDashboard').classList.add('hidden');
    document.getElementById('liveMapScreen').classList.add('hidden');
    document.getElementById('profileScreen').classList.add('hidden');
    document.getElementById('alertsScreen').classList.add('hidden');
    document.getElementById('settingsScreen').classList.add('hidden');
    stopLocationTracking();
    document.getElementById('bottomNav').classList.add('hidden');
    document.getElementById('headerActions').classList.add('hidden');
    document.getElementById('headerTitle').textContent = 'Welcome';
}

function hideAuthScreen() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('bottomNav').classList.remove('hidden');
    document.getElementById('headerActions').classList.remove('hidden');
}

function getSelectedRole() {
    const selected = document.querySelector('input[name="registerRole"]:checked');
    return selected ? selected.value : 'passenger';
}

function registerUser() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const role = getSelectedRole();

    if (!name || !email || !phone || !password) {
        showToast('Please complete all registration fields');
        return;
    }
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address');
        return;
    }
    if (!isValidPhone(phone)) {
        showToast('Phone must start with 7 and contain 8 digits');
        return;
    }

    const users = getStoredUsers();
    if (users.some(user => user.email === email)) {
        showToast('An account with that email already exists');
        return;
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password,
        userType: role,
        vehicle: role === 'driver' ? 'Combi • BWA 1234' : '',
        mustResetPassword: false
    };

    users.push(newUser);
    saveStoredUsers(users);
    showToast('Account created successfully! Please log in.');
    switchAuthTab('login');
}

function loginUser() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) {
        showToast('Enter your email and password');
        return;
    }
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address');
        return;
    }

    const users = getStoredUsers();
    const matchedUser = users.find(user => user.email === email && user.password === password);
    if (!matchedUser) {
        showToast('Invalid email or password');
        return;
    }

    onUserAuthenticated(matchedUser);
}

function resetPassword() {
    const email = document.getElementById('resetEmail').value.trim().toLowerCase();
    const phone = document.getElementById('resetPhone').value.trim();
    const password = document.getElementById('resetPassword').value;
    const confirmPassword = document.getElementById('resetConfirmPassword').value;

    if (!email || !phone || !password || !confirmPassword) {
        showToast('Please complete all reset fields');
        return;
    }
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address');
        return;
    }
    if (!isValidPhone(phone)) {
        showToast('Phone must start with 7 and contain 8 digits');
        return;
    }
    if (password !== confirmPassword) {
        showToast('Passwords do not match');
        return;
    }

    const users = getStoredUsers();
    const matchedUser = users.find(user => user.email === email && user.phone === phone);
    if (!matchedUser) {
        showToast('No account found with that email and phone');
        return;
    }

    matchedUser.password = password;
    matchedUser.mustResetPassword = false;
    saveStoredUsers(users);

    showToast('Password reset successful. You can now log in.');
    switchAuthTab('login');
}

function onUserAuthenticated(user) {
    currentUser = user;
    localStorage.setItem('smartTransportUser', JSON.stringify(user));
    updateUserUI();
    if (user.mustResetPassword) {
        showAuthScreen();
        switchAuthTab('reset');
        document.getElementById('resetEmail').value = user.email;
        document.getElementById('resetPhone').value = user.phone;
        return;
    }
    hideAuthScreen();

    if (user.userType === 'driver') {
        showDriverDashboard();
    } else {
        showPassengerDashboard();
    }
}

function updateUserUI() {
    if (!currentUser) return;
    document.getElementById('userName').textContent = currentUser.name || 'User';
    document.getElementById('userPhone').textContent = currentUser.phone || '+267 XXXXXXXX';
    document.getElementById('headerTitle').textContent = currentUser.userType === 'driver' ? 'Driver Dashboard' : 'Smart Transport BW';
    document.getElementById('headerActions').classList.remove('hidden');
    document.getElementById('dashboardSwitchBtn').classList.add('hidden');
}

function getDriverVehicles() {
    return [
        'Combi • BWA 1234',
        'Taxi • BWA 5678',
        'Bus • BWA 9101',
        'Mini Bus • BWA 3344'
    ];
}

function saveSelectedDriverVehicle() {
    const select = document.getElementById('driverVehicleSelect');
    if (!select || !currentUser) return;

    currentUser.vehicle = select.value;
    updateStoredCurrentUser();
    updateDriverInfoCard();
    showToast(`Vehicle selected: ${select.value}`);
}

function updateStoredCurrentUser() {
    localStorage.setItem('smartTransportUser', JSON.stringify(currentUser));
    const users = getStoredUsers();
    const existing = users.find(u => u.email === currentUser.email);
    if (existing) {
        Object.assign(existing, currentUser);
        saveStoredUsers(users);
    }
}

function renderDriverVehicleSelector() {
    const select = document.getElementById('driverVehicleSelect');
    if (!select || !currentUser) return;

    select.innerHTML = getDriverVehicles().map(vehicle => {
        const selected = vehicle === currentUser.vehicle ? ' selected' : '';
        return `<option value="${vehicle}"${selected}>${vehicle}</option>`;
    }).join('');
}

function setDefaultDriverVehicle() {
    if (!currentUser || currentUser.userType !== 'driver') return;
    if (!currentUser.vehicle) {
        currentUser.vehicle = getDriverVehicles()[0];
        updateStoredCurrentUser();
    }
}

function updateDriverInfoCard() {
    const nameElem = document.getElementById('driverName');
    const infoElem = document.getElementById('driverVehicleInfo');
    if (!currentUser) return;

    if (nameElem) {
        nameElem.textContent = currentUser.name;
    }
    if (infoElem) {
        infoElem.textContent = currentUser.vehicle || 'Combi • BWA 1234';
    }
}

function showPassengerDashboard() {
    hideMapScreen();
    document.getElementById('profileScreen').classList.add('hidden');
    currentDashboard = 'passenger';
    document.getElementById('passengerDashboard').classList.remove('hidden');
    document.getElementById('driverDashboard').classList.add('hidden');
    document.getElementById('headerTitle').textContent = 'Smart Transport BW';
    document.getElementById('bottomNav').classList.remove('hidden');
}

function showDriverDashboard() {
    hideMapScreen();
    document.getElementById('profileScreen').classList.add('hidden');
    currentDashboard = 'driver';
    document.getElementById('driverDashboard').classList.remove('hidden');
    document.getElementById('passengerDashboard').classList.add('hidden');
    document.getElementById('headerTitle').textContent = 'Driver Dashboard';
    document.getElementById('bottomNav').classList.remove('hidden');
    setDefaultDriverVehicle();
    renderDriverVehicleSelector();
    updateDriverInfoCard();
    loadDriverData();
}

function showSettingsContent() {
    hideMapScreen();
    document.getElementById('passengerDashboard').classList.add('hidden');
    document.getElementById('driverDashboard').classList.add('hidden');
    document.getElementById('profileScreen').classList.add('hidden');
    document.getElementById('alertsScreen').classList.add('hidden');
    document.getElementById('settingsScreen').classList.remove('hidden');
    document.getElementById('headerTitle').textContent = 'Settings';
    document.getElementById('bottomNav').classList.remove('hidden');
    populateSettingsForm();
}

function getTotalDriverEarnings() {
    const trips = JSON.parse(localStorage.getItem('driverTrips') || '[]');
    return trips.reduce((sum, t) => sum + (t.earnings || 0), 0);
}

function populateSettingsForm() {
    if (!currentUser) return;
    document.getElementById('currentPhone').value = currentUser.phone || '';
    // Clear password fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function updatePhoneNumber() {
    if (!currentUser) {
        showToast('Please log in first');
        return;
    }

    const newPhone = document.getElementById('newPhone').value.trim();
    if (!newPhone) {
        showToast('Please enter a new phone number');
        return;
    }

    if (!isValidPhone(newPhone)) {
        showToast('Phone must start with 7 and contain 8 digits');
        return;
    }

    if (newPhone === currentUser.phone) {
        showToast('New phone number is the same as current');
        return;
    }

    // Check if phone is already used by another user
    const users = getStoredUsers();
    if (users.some(user => user.email !== currentUser.email && user.phone === newPhone)) {
        showToast('This phone number is already registered');
        return;
    }

    currentUser.phone = newPhone;
    updateStoredCurrentUser();
    updateUserUI();
    document.getElementById('currentPhone').value = newPhone;
    document.getElementById('newPhone').value = '';
    showToast('Phone number updated successfully');
}

function updatePassword() {
    if (!currentUser) {
        showToast('Please log in first');
        return;
    }

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill all password fields');
        return;
    }

    if (currentPassword !== currentUser.password) {
        showToast('Current password is incorrect');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match');
        return;
    }

    if (newPassword === currentUser.password) {
        showToast('New password is the same as current');
        return;
    }

    currentUser.password = newPassword;
    updateStoredCurrentUser();
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    showToast('Password updated successfully');
}

function displayProfileInfo() {
    updateProfileScreen();
}

function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
}

function formatPrice(pula) {
    return `P${pula.toFixed(2)}`;
}

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error('Geolocation not supported'));
        }
    });
}

// ============ Navigation Functions ============

function setActiveNav(navId) {
    activeNav = navId;
    
    // Update bottom nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-nav') === navId) {
            btn.classList.add('active');
        }
    });
    
    // Handle navigation based on active nav
    switch(navId) {
        case 'home':
            showHomeContent();
            break;
        case 'map':
            showMapContent();
            break;
        case 'alerts':
            showAlertsContent();
            break;
        case 'profile':
            showProfileContent();
            break;
    }
}

function showHomeContent() {
    hideMapScreen();
    if (currentUser && currentUser.userType === 'driver') {
        showDriverDashboard();
    } else {
        showPassengerDashboard();
    }
    // Scroll to top
    document.querySelector('.main-content').scrollTop = 0;
}

function showMapContent() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('passengerDashboard').classList.add('hidden');
    document.getElementById('driverDashboard').classList.add('hidden');
    document.getElementById('liveMapScreen').classList.remove('hidden');
    document.getElementById('headerTitle').textContent = 'Live Map';
    document.getElementById('bottomNav').classList.remove('hidden');
    initLiveMap();
    startLocationTracking();
}

function hideMapScreen() {
    const mapScreen = document.getElementById('liveMapScreen');
    if (mapScreen) {
        mapScreen.classList.add('hidden');
    }
    stopLocationTracking();
}

function initLiveMap() {
    if (liveMapState.map) {
        return;
    }

    const map = L.map('mapContainer', {
        center: [-24.6588, 25.9083],
        zoom: 13,
        zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    liveMapState.map = map;
    liveMapState.polyline = L.polyline([], { color: '#10b981', weight: 5, opacity: 0.9 }).addTo(map);
    liveMapState.driverPath = L.polyline([], { color: '#2563eb', weight: 4, dashArray: '8,6', opacity: 0.8 }).addTo(map);
}

function startLocationTracking() {
    const status = document.getElementById('mapStatus');
    if (!navigator.geolocation) {
        if (status) status.textContent = 'Geolocation is not supported by your browser.';
        showToast('Geolocation not available');
        return;
    }

    if (liveMapState.watchId !== null) {
        return;
    }

    liveMapState.watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            updateMapPosition(latitude, longitude, accuracy);
            if (status) {
                status.textContent = `Current position: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (accuracy ${accuracy}m)`;
            }
        },
        (error) => {
            if (status) status.textContent = 'Unable to get GPS signal. Please allow location access.';
            showToast('GPS tracking failed: ' + error.message);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 20000
        }
    );
}

function stopLocationTracking() {
    if (liveMapState.watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(liveMapState.watchId);
        liveMapState.watchId = null;
    }
}

function updateMapPosition(lat, lng, accuracy) {
    if (!liveMapState.map) {
        return;
    }

    const latLng = [lat, lng];
    liveMapState.path.push(latLng);
    liveMapState.polyline.setLatLngs(liveMapState.path);

    if (!liveMapState.marker) {
        liveMapState.marker = L.circleMarker(latLng, {
            radius: 10,
            fillColor: '#10b981',
            color: '#ffffff',
            weight: 2,
            fillOpacity: 0.9
        }).addTo(liveMapState.map).bindPopup('You');
    } else {
        liveMapState.marker.setLatLng(latLng);
    }

    updateDriverMarker(lat, lng);

    liveMapState.map.setView(latLng, 15);
}

function updateDriverMarker(userLat, userLng) {
    const driverLatLng = getSimulatedDriverPosition(userLat, userLng);
    if (!liveMapState.driverMarker) {
        liveMapState.driverMarker = L.marker(driverLatLng, {
            icon: L.divIcon({
                className: 'driver-marker-icon',
                html: '<i class="fas fa-car"></i>'
            })
        }).addTo(liveMapState.map).bindPopup('Driver vehicle accepted your request');
    } else {
        liveMapState.driverMarker.setLatLng(driverLatLng);
    }

    liveMapState.driverPath.setLatLngs([driverLatLng, [userLat, userLng]]);
    const distance = getDistanceMeters(driverLatLng, [userLat, userLng]);
    const status = document.getElementById('mapStatus');
    if (status) {
        status.textContent = `Driver is ${Math.round(distance)}m away. Current position: ${userLat.toFixed(6)}, ${userLng.toFixed(6)}`;
    }
}

function getSimulatedDriverPosition(userLat, userLng) {
    const offsetLat = 0.0025; // ~250m north
    const offsetLng = 0.0025; // ~250m east
    return [userLat + offsetLat, userLng + offsetLng];
}

function getDistanceMeters(a, b) {
    const toRad = (deg) => deg * Math.PI / 180;
    const lat1 = a[0];
    const lon1 = a[1];
    const lat2 = b[0];
    const lon2 = b[1];
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const sinDLat = Math.sin(dLat / 2) * Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const aVal = sinDLat + Math.cos(phi1) * Math.cos(phi2) * sinDLon;
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return R * c;
}

function returnHome() {
    hideMapScreen();
    if (currentUser && currentUser.userType === 'driver') {
        showDriverDashboard();
    } else {
        showPassengerDashboard();
    }
}

function showAlertsContent() {
    hideMapScreen();
    document.getElementById('passengerDashboard').classList.add('hidden');
    document.getElementById('driverDashboard').classList.add('hidden');
    document.getElementById('profileScreen').classList.add('hidden');
    document.getElementById('settingsScreen').classList.add('hidden');
    document.getElementById('alertsScreen').classList.remove('hidden');
    document.getElementById('headerTitle').textContent = 'Alerts';
    document.getElementById('bottomNav').classList.remove('hidden');
    displayAlerts();
}

function showProfileContent() {
    hideMapScreen();
    document.getElementById('passengerDashboard').classList.add('hidden');
    document.getElementById('driverDashboard').classList.add('hidden');
    document.getElementById('alertsScreen').classList.add('hidden');
    document.getElementById('settingsScreen').classList.add('hidden');
    document.getElementById('profileScreen').classList.remove('hidden');
    document.getElementById('headerTitle').textContent = 'Profile';
    document.getElementById('bottomNav').classList.remove('hidden');
    updateProfileScreen();
}

function navigateTo(section) {
    closeDrawer();
    switch(section) {
        case 'profile':
            showProfileContent();
            setActiveNav('profile');
            break;
        case 'saved-places':
            showSavedPlaces();
            break;
        case 'favorites':
            showFavorites();
            break;
        case 'history':
            showTripHistory();
            break;
        case 'settings':
            showSettingsContent();
            break;
    }
}

// ============ Dashboard Switching ============

function switchDashboard() {
    if (currentDashboard === 'passenger') {
        currentDashboard = 'driver';
        document.getElementById('passengerDashboard').classList.add('hidden');
        document.getElementById('driverDashboard').classList.remove('hidden');
        document.getElementById('headerTitle').textContent = 'Driver Mode';
        showToast('Switched to Driver Dashboard');
        loadDriverData();
    } else {
        currentDashboard = 'passenger';
        document.getElementById('passengerDashboard').classList.remove('hidden');
        document.getElementById('driverDashboard').classList.add('hidden');
        document.getElementById('headerTitle').textContent = 'Smart Transport BW';
        showToast('Switched to Passenger Dashboard');
    }
}

// ============ Logout Function ============

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('smartTransportUser');
        currentUser = null;
        showToast('Logged out successfully');
        currentDashboard = 'passenger';
        document.getElementById('passengerDashboard').classList.add('hidden');
        document.getElementById('driverDashboard').classList.add('hidden');
        document.getElementById('headerTitle').textContent = 'Welcome';
        showAuthScreen();
        switchAuthTab('login');
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('resetEmail').value = '';
        document.getElementById('resetPhone').value = '';
        document.getElementById('resetPassword').value = '';
        document.getElementById('resetConfirmPassword').value = '';
    }
}

// ============ SOS Function ============

function startSOSPress() {
    if (sosPressed) return;
    
    const sosButton = document.getElementById('sosButton');
    const sosProgress = document.getElementById('sosProgress');
    const sosProgressBar = document.getElementById('sosProgressBar');
    const sosText = document.getElementById('sosText');
    
    sosProgress.classList.remove('hidden');
    sosProgressBar.style.width = '0%';
    
    let progress = 0;
    sosPressTimer = setInterval(() => {
        progress += 5;
        sosProgressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(sosPressTimer);
            activateSOS();
        }
    }, 150);
}

function cancelSOSPress() {
    if (sosPressTimer) {
        clearInterval(sosPressTimer);
        sosPressTimer = null;
    }
    const sosProgress = document.getElementById('sosProgress');
    const sosProgressBar = document.getElementById('sosProgressBar');
    if (sosProgress) {
        sosProgress.classList.add('hidden');
        sosProgressBar.style.width = '0%';
    }
}

function activateSOS() {
    cancelSOSPress();
    
    const trustedContacts = getTrustedContacts();
    const currentLocation = "Gaborone, Botswana"; // In real app, get actual GPS
    
    // Send SOS alerts to contacts
    trustedContacts.forEach(contact => {
        console.log(`SOS sent to ${contact}`);
        // In production, this would call an API
    });
    
    showToast('🚨 EMERGENCY ALERT SENT! Contacts notified.');
    
    // Update UI
    const sosButton = document.getElementById('sosButton');
    sosButton.classList.add('sos-active');
    sosButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ALERT SENT!';
    
    setTimeout(() => {
        sosButton.classList.remove('sos-active');
        sosButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> HOLD FOR SOS (3s)';
    }, 5000);
    
    // Save to history
    saveToHistory('emergency', { timestamp: new Date().toISOString(), contacts: trustedContacts });
}

// ============ Trusted Contacts Management ============

function getTrustedContacts() {
    const contacts = localStorage.getItem('trustedContacts');
    return contacts ? JSON.parse(contacts) : ['+267 71 234 567'];
}

function addTrustedContact() {
    const input = document.getElementById('newContact');
    const phone = input.value.trim();
    
    if (phone && /^[\+]?[0-9]{10,15}$/.test(phone)) {
        const contacts = getTrustedContacts();
        if (!contacts.includes(phone)) {
            contacts.push(phone);
            localStorage.setItem('trustedContacts', JSON.stringify(contacts));
            updateTrustedContactsUI();
            input.value = '';
            showToast('Contact added successfully');
        } else {
            showToast('Contact already exists');
        }
    } else {
        showToast('Please enter a valid phone number');
    }
}

function removeContact(element) {
    const contactText = element.parentElement.querySelector('span').textContent;
    let contacts = getTrustedContacts();
    contacts = contacts.filter(c => c !== contactText);
    localStorage.setItem('trustedContacts', JSON.stringify(contacts));
    updateTrustedContactsUI();
    showToast('Contact removed');
}

function updateTrustedContactsUI() {
    const container = document.getElementById('trustedContactsList');
    if (!container) return;
    
    const contacts = getTrustedContacts();
    container.innerHTML = contacts.map(contact => `
        <div class="contact-chip">
            <span>${contact}</span>
            <i class="fas fa-times" onclick="removeContact(this)"></i>
        </div>
    `).join('');
}

// ============ History Storage ============

function saveToHistory(type, data) {
    let history = JSON.parse(localStorage.getItem('tripHistory') || '[]');
    history.unshift({
        id: Date.now(),
        type: type,
        data: data,
        timestamp: new Date().toISOString()
    });
    // Keep only last 50 items
    history = history.slice(0, 50);
    localStorage.setItem('tripHistory', JSON.stringify(history));
}

function getTripHistory() {
    return JSON.parse(localStorage.getItem('tripHistory') || '[]');
}

// ============ Profile Management ============

function displayProfileInfo() {
    const profileContent = document.getElementById('routesTab');
    if (profileContent && activeNav === 'profile') {
        const user = JSON.parse(localStorage.getItem('smartTransportUser') || '{}');
        profileContent.innerHTML = `
            <div class="search-card">
                <div class="text-center">
                    <i class="fas fa-user-circle" style="font-size: 4rem; color: var(--primary-green);"></i>
                    <h3 class="mt-2">${user.name || 'Guest User'}</h3>
                    <p>${user.phone || '+267 XXXXXXXX'}</p>
                    <p>${user.email || 'user@example.com'}</p>
                </div>
                <hr class="mt-3 mb-2" style="border-color: var(--border-color);">
                <div class="flex" style="justify-content: space-around;">
                    <div class="text-center">
                        <strong>${getTripHistory().length}</strong><br>
                        <small>Trips</small>
                    </div>
                    <div class="text-center">
                        <strong>4.8 ★</strong><br>
                        <small>Rating</small>
                    </div>
                    <div class="text-center">
                        <strong>${getTrustedContacts().length}</strong><br>
                        <small>Trusted</small>
                    </div>
                </div>
            </div>
        `;
    }
}

function displayAlerts() {
    const alertsContent = document.getElementById('alertsContent');
    if (!alertsContent) return;

    let alertsHtml = `
        <div class="route-stop">
            <span><i class="fas fa-traffic-light" style="color: var(--warning-orange);"></i> Traffic congestion on A1</span>
            <span class="fare-amount">Active</span>
        </div>
        <div class="route-stop">
            <span><i class="fas fa-road" style="color: var(--error-red);"></i> Road closure - Main Mall</span>
            <span class="fare-amount">New</span>
        </div>
        <div class="route-stop">
            <span><i class="fas fa-bus" style="color: var(--primary-green);"></i> Bus delay - Gaborone to Francistown</span>
            <span class="fare-amount">30 min</span>
        </div>
    `;

    if (currentUser && currentUser.userType === 'driver') {
        // Add passenger requests for drivers
        const requests = [
            { id: 1, name: 'Pearl', pickup: 'BBS Mall', destination: 'Riverwalk', passengers: 2, time: '2 min ago' },
            { id: 2, name: 'Ogone', pickup: 'Main Mall', destination: 'University', passengers: 1, time: '5 min ago' },
            { id: 3, name: 'Goitse', pickup: 'Block 8', destination: 'CBD', passengers: 3, time: '8 min ago' }
        ];

        alertsHtml += '<h4 class="mt-3"><i class="fas fa-users"></i> Passenger Requests</h4>';
        alertsHtml += requests.map(req => `
            <div class="request-card">
                <div class="request-info">
                    <h4><i class="fas fa-user"></i> ${req.name}</h4>
                    <p><i class="fas fa-map-pin"></i> From: ${req.pickup}</p>
                    <p><i class="fas fa-flag-checkered"></i> To: ${req.destination}</p>
                    <p><i class="fas fa-users"></i> ${req.passengers} passengers</p>
                    <small class="text-gray">${req.time}</small>
                </div>
                <div class="request-actions">
                    <button class="accept-btn" onclick="acceptRequest(${req.id})">Accept</button>
                    <button class="decline-btn" onclick="declineRequest(${req.id})">Decline</button>
                </div>
            </div>
        `).join('');
    }

    alertsContent.innerHTML = alertsHtml;
}

// ============ Initialization ============

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    updateTrustedContactsUI();

    if (!localStorage.getItem('sampleRoutesLoaded')) {
        localStorage.setItem('sampleRoutesLoaded', 'true');
        saveSampleData();
    }
});

function initAuth() {
    const savedUser = localStorage.getItem('smartTransportUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        onUserAuthenticated(currentUser);
    } else {
        showAuthScreen();
    }
}

function saveSampleData() {
    // Save sample favorite routes
    const favorites = [
        { id: 1, from: 'Home', to: 'Work', type: 'shared-taxi', fare: 10, duration: 15 },
        { id: 2, from: 'Home', to: 'University', type: 'combi', fare: 9, duration: 22 }
    ];
    localStorage.setItem('favoriteRoutes', JSON.stringify(favorites));
    
    // Save sample saved places
    const savedPlaces = [
        { id: 1, name: 'Home', icon: 'home', address: '123 Gaborone West' },
        { id: 2, name: 'Work', icon: 'briefcase', address: 'CBD Office Park' },
        { id: 3, name: 'University', icon: 'graduation-cap', address: 'University of Botswana' }
    ];
    localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces));
}