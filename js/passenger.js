// Smart Transport BW - Passenger Dashboard Functions

// Tab Navigation
function showTab(tabName, evt) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    }
    
    document.getElementById('routesTab').classList.add('hidden');
    document.getElementById('safetyTab').classList.add('hidden');
    document.getElementById('bookingsTab').classList.add('hidden');
    
    if (tabName === 'routes') {
        document.getElementById('routesTab').classList.remove('hidden');
    } else if (tabName === 'safety') {
        document.getElementById('safetyTab').classList.remove('hidden');
        updateTrustedContactsUI();
    } else if (tabName === 'bookings') {
        document.getElementById('bookingsTab').classList.remove('hidden');
        displayBookings();
    }
}

// Share Trip Function
function shareLiveTrip() {
    const contact = document.getElementById('trustedContact')?.value;
    if (contact) {
        addTrustedContact();
        shareLiveLocation();
    } else {
        showToast('Please add a trusted contact first');
    }
}

// SOS Button Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const sosButton = document.getElementById('sosButton');
    if (sosButton) {
        let pressTimer;
        let progressInterval;
        
        sosButton.addEventListener('mousedown', () => {
            const sosProgress = document.getElementById('sosProgress');
            const sosProgressBar = document.getElementById('sosProgressBar');
            const sosText = document.getElementById('sosText');
            
            sosProgress.classList.remove('hidden');
            sosProgressBar.style.width = '0%';
            
            let progress = 0;
            pressTimer = setTimeout(() => {
                clearInterval(progressInterval);
                activateSOS();
            }, 3000);
            
            progressInterval = setInterval(() => {
                progress += 5;
                sosProgressBar.style.width = `${progress}%`;
                if (progress >= 100) {
                    clearInterval(progressInterval);
                }
            }, 150);
        });
        
        sosButton.addEventListener('mouseup', () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
            const sosProgress = document.getElementById('sosProgress');
            const sosProgressBar = document.getElementById('sosProgressBar');
            if (sosProgress) {
                sosProgress.classList.add('hidden');
                sosProgressBar.style.width = '0%';
            }
        });
        
        sosButton.addEventListener('mouseleave', () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
            const sosProgress = document.getElementById('sosProgress');
            const sosProgressBar = document.getElementById('sosProgressBar');
            if (sosProgress) {
                sosProgress.classList.add('hidden');
                sosProgressBar.style.width = '0%';
            }
        });
        
        // Touch events for mobile
        sosButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const sosProgress = document.getElementById('sosProgress');
            const sosProgressBar = document.getElementById('sosProgressBar');
            const sosText = document.getElementById('sosText');
            
            sosProgress.classList.remove('hidden');
            sosProgressBar.style.width = '0%';
            
            let progress = 0;
            pressTimer = setTimeout(() => {
                clearInterval(progressInterval);
                activateSOS();
            }, 3000);
            
            progressInterval = setInterval(() => {
                progress += 5;
                sosProgressBar.style.width = `${progress}%`;
                if (progress >= 100) {
                    clearInterval(progressInterval);
                }
            }, 150);
        });
        
        sosButton.addEventListener('touchend', () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
            const sosProgress = document.getElementById('sosProgress');
            const sosProgressBar = document.getElementById('sosProgressBar');
            if (sosProgress) {
                setTimeout(() => {
                    sosProgress.classList.add('hidden');
                    sosProgressBar.style.width = '0%';
                }, 100);
            }
        });
    }
});

// Open Full Map
function openFullMap() {
    showToast('Opening full map view with live vehicle tracking...');
    showMapContent();
}

// Saved Places Functions
function showSavedPlaces() {
    const savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
    if (savedPlaces.length === 0) {
        showToast('No saved places yet. Add your first place!');
    } else {
        showToast(`${savedPlaces.length} saved places available`);
    }
}

// Trip History Functions
function showTripHistory() {
    const history = getTripHistory();
    if (history.length === 0) {
        showToast('No trip history yet');
    } else {
        showToast(`${history.length} trips in history`);
    }
}

// Settings Functions
function showSettings() {
    showSettingsContent();
}