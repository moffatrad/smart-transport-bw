// Smart Transport BW - API Functions

const API_BASE_URL = '/smart-transport-bw/php/';

// ============ Route Data ============

const routeData = {
    routes: [
        {
            id: 1,
            type: 'shared-taxi',
            typeIcon: 'fa-taxi',
            typeName: 'Shared Taxi',
            from: 'Gaborone Bus Rank',
            to: 'University of Botswana',
            duration: 15,
            fare: 10,
            seatsAvailable: 3,
            totalSeats: 4,
            traffic: 'light',
            stops: ['Gaborone Bus Rank', 'BBS Mall', 'Riverwalk', 'University']
        },
        {
            id: 2,
            type: 'combi',
            typeIcon: 'fa-car',
            typeName: 'Combi',
            from: 'Gaborone Bus Rank',
            to: 'University of Botswana',
            duration: 22,
            fare: 9,
            seatsAvailable: 12,
            totalSeats: 15,
            traffic: 'moderate',
            stops: ['Main Mall', 'Block 8', 'Broadhurst', 'University']
        },
        {
            id: 3,
            type: 'bus',
            typeIcon: 'fa-bus',
            typeName: 'Inter-City Bus',
            from: 'Gaborone',
            to: 'Francistown',
            duration: 390,
            fare: 168,
            seatsAvailable: 30,
            totalSeats: 45,
            traffic: 'light',
            distance: 435,
            ratePerKm: 0.38
        }
    ]
};

// ============ Route Search ============

function searchRoutes() {
    const fromInput = document.getElementById('fromLocation');
    const toInput = document.getElementById('toLocation');
    const from = fromInput ? fromInput.value : 'Gaborone Bus Rank';
    const to = toInput ? toInput.value : 'University of Botswana';
    
    showLoading('routeResults');
    
    // Simulate API call
    setTimeout(() => {
        displayRouteResults(from, to);
    }, 500);
}

function displayRouteResults(from, to) {
    const container = document.getElementById('routeResults');
    
    // Filter routes based on search
    const matchingRoutes = routeData.routes.filter(route => 
        route.from.toLowerCase().includes(from.toLowerCase()) ||
        route.to.toLowerCase().includes(to.toLowerCase())
    );
    
    if (matchingRoutes.length === 0) {
        container.innerHTML = `
            <div class="search-card text-center">
                <i class="fas fa-map-marked-alt" style="font-size: 3rem; color: var(--text-gray);"></i>
                <h4 class="mt-2">No routes found</h4>
                <p class="mt-2">Try a different destination or check back later</p>
                <button class="btn-primary mt-3" onclick="searchRoutes()">Search Again</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = matchingRoutes.map(route => `
        <div class="route-card ${route.type === 'bus' ? 'bus-card' : ''}" onclick="viewRouteDetails(${route.id})">
            <div class="route-info">
                <h4><i class="fas ${route.typeIcon}"></i> ${route.typeName}</h4>
                <div class="route-details">
                    <span><i class="fas fa-clock"></i> ${formatTime(route.duration)}</span>
                    <span class="seat-badge"><i class="fas fa-chair"></i> ${route.seatsAvailable}/${route.totalSeats} seats</span>
                    <span class="traffic-badge ${route.traffic === 'light' ? 'green' : route.traffic === 'moderate' ? 'yellow' : 'red'}">
                        <i class="fas fa-traffic-light"></i> ${route.traffic}
                    </span>
                </div>
            </div>
            <div class="route-actions">
                <span class="fare">${formatPrice(route.fare)}</span>
                <button class="start-btn" onclick="event.stopPropagation(); startRoute(${route.id})">Go</button>
            </div>
        </div>
    `).join('');
}

function viewRouteDetails(routeId) {
    const route = routeData.routes.find(r => r.id === routeId);
    if (!route) return;
    
    const container = document.getElementById('routeResults');
    container.innerHTML = `
        <div class="search-card">
            <h4><i class="fas ${route.typeIcon}"></i> ${route.typeName} - Journey Details</h4>
            <div class="route-details mt-2">
                <div><i class="fas fa-map-pin"></i> From: ${route.from}</div>
                <div><i class="fas fa-flag-checkered"></i> To: ${route.to}</div>
            </div>
            <div class="timeline mt-3">
                ${route.stops ? route.stops.map((stop, idx) => `
                    <div class="timeline-stop">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <strong>Step ${idx + 1}</strong><br>
                            ${stop}
                        </div>
                    </div>
                `).join('') : '<p>Route details available in full version</p>'}
            </div>
            <div class="fare-summary mt-3">
                <span>Total Fare:</span>
                <strong>${formatPrice(route.fare)}</strong>
            </div>
            <button class="btn-primary mt-3" onclick="startRoute(${route.id})">Start Navigation</button>
            <button class="btn-secondary mt-2" onclick="searchRoutes()">Back to Results</button>
        </div>
    `;
}

function startRoute(routeId) {
    const route = routeData.routes.find(r => r.id === routeId);
    showToast(`Starting route to ${route.to}. Navigation will begin shortly.`);
    saveToHistory('trip', { routeId: routeId, route: route, started: new Date().toISOString() });
}

// ============ Fare Information ============

function showFareInfo() {
    const modal = document.getElementById('fareInfoModal');
    modal.classList.add('show');
}

function showFareTab(tab) {
    // Update tab styles
    document.querySelectorAll('.fare-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const fareContent = document.getElementById('fareContent');
    if (tab === 'taxi') {
        fareContent.innerHTML = `
            <div class="fare-info">
                <div class="route-stop"><span>University of Botswana</span><span class="fare-amount">P10.00</span></div>
                <div class="route-stop"><span>BBS Mall</span><span class="fare-amount">P10.00</span></div>
                <div class="route-stop"><span>Riverwalk</span><span class="fare-amount">P10.00</span></div>
                <div class="route-stop"><span>Main Mall</span><span class="fare-amount">P10.00</span></div>
            </div>
        `;
    } else if (tab === 'combi') {
        fareContent.innerHTML = `
            <div class="fare-info">
                <div class="route-stop"><span>Block 8</span><span class="fare-amount">P9.00</span></div>
                <div class="route-stop"><span>Broadhurst</span><span class="fare-amount">P9.00</span></div>
                <div class="route-stop"><span>Mogoditshane</span><span class="fare-amount">P9.00</span></div>
                <div class="route-stop"><span>Tlokweng</span><span class="fare-amount">P9.00</span></div>
            </div>
        `;
    } else {
        fareContent.innerHTML = `
            <div class="fare-info">
                <div class="route-stop"><span>Gaborone (0km)</span><span class="fare-amount">P0.00</span></div>
                <div class="route-stop"><span>Sebele (11km)</span><span class="fare-amount">P4.20</span></div>
                <div class="route-stop"><span>Mahalapye (200km)</span><span class="fare-amount">P76.00</span></div>
                <div class="route-stop"><span>Palapye (270km)</span><span class="fare-amount">P102.60</span></div>
                <div class="route-stop"><span>Francistown (435km)</span><span class="fare-amount">P168.00</span></div>
            </div>
        `;
    }
}

// ============ Bus Booking ============

function openBusBooking() {
    const modal = document.getElementById('busBookingModal');
    document.getElementById('busDate').value = new Date().toISOString().split('T')[0];
    generateSeatGrid();
    modal.classList.add('show');
}

function generateSeatGrid() {
    const grid = document.getElementById('seatGrid');
    if (!grid) return;
    
    let seatsHtml = '';
    for (let i = 1; i <= 45; i++) {
        const isOccupied = [5, 10, 15, 20, 25].includes(i);
        seatsHtml += `
            <div class="seat ${isOccupied ? 'occupied' : 'available'}" data-seat="${i}" onclick="selectSeat(this, ${i})">
                ${i}
            </div>
        `;
    }
    grid.innerHTML = seatsHtml;
}

let selectedSeat = null;

function selectSeat(element, seatNumber) {
    if (element.classList.contains('occupied')) {
        showToast('This seat is already booked');
        return;
    }
    
    // Deselect previous
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
    });
    
    element.classList.add('selected');
    selectedSeat = seatNumber;
    
    // Update fare
    const from = document.getElementById('busFrom').value;
    const to = document.getElementById('busTo').value;
    updateFareEstimate(from, to);
}

function autoSelectSeat() {
    const available = document.querySelectorAll('.seat.available:not(.selected)');
    if (available.length > 0) {
        available[0].click();
        showToast('Best available seat selected');
    }
}

function updateFareEstimate(from, to) {
    const fares = {
        'Gaborone-Francistown': 168,
        'Francistown-Gaborone': 168,
        'Gaborone-Maun': 331,
        'Maun-Gaborone': 331,
        'Francistown-Maun': 450,
        'Maun-Francistown': 450
    };
    const key = `${from}-${to}`;
    const fare = fares[key] || 168;
    document.getElementById('estimatedFare').textContent = `P${fare.toFixed(2)}`;
}

function confirmBooking() {
    if (!selectedSeat) {
        showToast('Please select a seat');
        return;
    }
    
    const from = document.getElementById('busFrom').value;
    const to = document.getElementById('busTo').value;
    const date = document.getElementById('busDate').value;
    const fare = document.getElementById('estimatedFare').textContent;
    const bookingRef = `STB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const booking = {
        ref: bookingRef,
        from: from,
        to: to,
        date: date,
        seat: selectedSeat,
        fare: fare,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    let bookings = JSON.parse(localStorage.getItem('busBookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('busBookings', JSON.stringify(bookings));
    
    closeModal('busBookingModal');
    showBookingConfirmation(booking);
}

function showBookingConfirmation(booking) {
    const modal = document.getElementById('bookingConfirmModal');
    const details = document.getElementById('bookingDetails');
    document.getElementById('bookingRef').textContent = `Booking Ref: ${booking.ref}`;
    
    details.innerHTML = `
        <p><strong>From:</strong> ${booking.from}</p>
        <p><strong>To:</strong> ${booking.to}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Seat:</strong> ${booking.seat}</p>
        <p><strong>Fare:</strong> ${booking.fare}</p>
    `;
    
    modal.classList.add('show');
    
    // Refresh bookings list
    displayBookings();
}

function displayBookings() {
    const container = document.getElementById('bookingsList');
    if (!container) return;
    
    const bookings = JSON.parse(localStorage.getItem('busBookings') || '[]');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--text-gray);">No active bookings</p>';
        return;
    }
    
    container.innerHTML = bookings.slice(0, 5).map(booking => `
        <div class="route-card">
            <div class="route-info">
                <h4><i class="fas fa-bus"></i> ${booking.from} → ${booking.to}</h4>
                <div class="route-details">
                    <span><i class="fas fa-calendar"></i> ${booking.date}</span>
                    <span><i class="fas fa-chair"></i> Seat ${booking.seat}</span>
                    <span class="fare">${booking.fare}</span>
                </div>
            </div>
            <div class="route-actions">
                <span class="seat-badge">Confirmed</span>
            </div>
        </div>
    `).join('');
}

// ============ Modal Functions ============

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// ============ Helper Functions ============

function quickFindRoute() {
    document.getElementById('toLocation').focus();
}

function showNearby() {
    showToast('Finding nearby transport options...');
}

function showTraffic() {
    showToast('Current traffic: Light congestion in CBD area');
}

function requestTaxi() {
    showToast('Requesting taxi... A driver will be assigned shortly');
}

function showFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favoriteRoutes') || '[]');
    if (favorites.length === 0) {
        showToast('No favorite routes saved yet');
    } else {
        showToast(`${favorites.length} favorite routes available`);
    }
}

function shareLiveLocation() {
    showToast('Trip sharing activated. Your location will be shared with trusted contacts.');
    saveToHistory('safety', { action: 'trip_sharing', timestamp: new Date().toISOString() });
}

function setCheckIn() {
    const time = prompt('Set check-in reminder time (e.g., 30 minutes):', '30');
    if (time) {
        showToast(`Check-in reminder set for ${time} minutes`);
    }
}