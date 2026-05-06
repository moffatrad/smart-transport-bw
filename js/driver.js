// Smart Transport BW - Driver Dashboard Functions

let currentSeats = 4;
let tripActive = false;
let departureTimer = null;
let timerSeconds = 300; // 5 minutes

// Load Driver Data
function loadDriverData() {
    updateSeatDisplay();
    loadPassengerRequests();
}

// Seat Management
function adjustSeats(change) {
    let newSeats = currentSeats + change;
    if (newSeats >= 0 && newSeats <= 15) {
        currentSeats = newSeats;
        updateSeatDisplay();
        
        // Send update to backend (simulated)
        console.log(`Seats updated: ${currentSeats}/15 available`);
    }
}

function updateSeatDisplay() {
    const seatCountElem = document.getElementById('seatCount');
    const seatProgressFill = document.getElementById('seatProgressFill');
    
    if (seatCountElem) {
        seatCountElem.textContent = currentSeats;
    }
    
    if (seatProgressFill) {
        const percentage = ((15 - currentSeats) / 15) * 100;
        seatProgressFill.style.width = `${percentage}%`;
    }
}

// Trip Management
function startTrip() {
    if (tripActive) {
        showToast('Trip already in progress');
        return;
    }
    
    tripActive = true;
    showDepartureTimer();
    showToast('Starting trip. Countdown initiated.');
}

function showDepartureTimer() {
    const timerDiv = document.getElementById('departureTimer');
    timerDiv.classList.remove('hidden');
    timerSeconds = 300;
    updateTimerDisplay();
    
    if (departureTimer) clearInterval(departureTimer);
    
    departureTimer = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            clearInterval(departureTimer);
            departureTimer = null;
            timerDiv.classList.add('hidden');
            tripActive = false;
            showToast('Trip started! Drive safely.');
            saveTripRecord();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const timerSpan = document.getElementById('timerSeconds');
    if (timerSpan) {
        timerSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function cancelDeparture() {
    if (departureTimer) {
        clearInterval(departureTimer);
        departureTimer = null;
    }
    document.getElementById('departureTimer').classList.add('hidden');
    tripActive = false;
    showToast('Departure cancelled');
}

function saveTripRecord() {
    const tripRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        seatsFilled: 15 - currentSeats,
        earnings: (15 - currentSeats) * 10,
        route: 'Gaborone - Various'
    };
    
    let trips = JSON.parse(localStorage.getItem('driverTrips') || '[]');
    trips.push(tripRecord);
    localStorage.setItem('driverTrips', JSON.stringify(trips));
    
    updateDriverStats();
}

function updateDriverStats() {
    const trips = JSON.parse(localStorage.getItem('driverTrips') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayTrips = trips.filter(t => t.timestamp.split('T')[0] === today);
    
    const totalPassengers = todayTrips.reduce((sum, t) => sum + t.seatsFilled, 0);
    const totalEarnings = todayTrips.reduce((sum, t) => sum + t.earnings, 0);
    
    const passengersElem = document.getElementById('todayPassengers');
    const earningsElem = document.getElementById('todayEarnings');
    
    if (passengersElem) passengersElem.textContent = totalPassengers;
    if (earningsElem) earningsElem.textContent = `P${totalEarnings.toLocaleString()}`;
}

// Traffic Reporting
function updateTraffic() {
    const condition = prompt('Report traffic condition:', 'Moderate congestion');
    if (condition) {
        showToast(`Traffic reported: ${condition}`);
        // In production, this would broadcast to all users
    }
}

function reportTraffic() {
    updateTraffic();
}

// Passenger Requests
function loadPassengerRequests() {
    const container = document.getElementById('passengerRequests');
    if (!container) return;
    
    // Sample passenger requests
    const requests = [
        { id: 1, name: 'Pearl', pickup: 'BBS Mall', destination: 'Riverwalk', passengers: 2, time: '2 min ago' },
        { id: 2, name: 'Ogone', pickup: 'Main Mall', destination: 'University', passengers: 1, time: '5 min ago' },
        { id: 3, name: 'Goitse', pickup: 'Block 8', destination: 'CBD', passengers: 3, time: '8 min ago' }
    ];
    
    container.innerHTML = requests.map(req => `
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

function viewPassengerRequests() {
    loadPassengerRequests();
    showToast('Loading nearby passenger requests...');
}

function acceptRequest(requestId) {
    showToast(`Request #${requestId} accepted! Passenger notified.`);
    // Remove from UI
    const requestCard = event.target.closest('.request-card');
    if (requestCard) {
        requestCard.remove();
    }
}

function declineRequest(requestId) {
    showToast(`Request #${requestId} declined`);
    const requestCard = event.target.closest('.request-card');
    if (requestCard) {
        requestCard.remove();
    }
}

// Initialize driver stats on load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('driverDashboard')) {
        updateDriverStats();
    }
});