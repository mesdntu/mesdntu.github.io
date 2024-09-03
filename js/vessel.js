let vesselData = []; // Store parsed CSV data
let ownerNameIndex = -1; // Index for "Owner Name"

// Load CSV data function
async function loadVesselData() {
    try {
        const response = await fetch('/data/B100 data.csv'); // Adjust path as needed
        const text = await response.text();
        vesselData = parseCSV(text);

        // Get URL parameter vessel name and display info
        const urlParams = new URLSearchParams(window.location.search);
        const vesselName = urlParams.get('vessel');

        if (vesselName) {
            displayVesselInfo(vesselName);
        }
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}

// Parse CSV function
function parseCSV(text) {
    const rows = text.split('\n');
    const headers = rows[0].split(',').map(header => header.trim().toLowerCase());

    return rows.slice(1).map(row => {
        const cols = row.split(',');
        return {
            vesselName: (cols[headers.indexOf('vessel name')] || '').trim(),
            ownerName: (cols[headers.indexOf('owner name')] || '').trim(),
            gt: (cols[headers.indexOf('gt')] || '').trim(),
            length: (cols[headers.indexOf('length')] || '').trim(),
            breadth: (cols[headers.indexOf('breadth')] || '').trim(),
            depth: (cols[headers.indexOf('depth')] || '').trim(),
            deadWeight: (cols[headers.indexOf('dead weight')] || '').trim(),
            yearBuilt: (cols[headers.indexOf('year built')] || '').trim(),
            engineBrand: (cols[headers.indexOf('engine brand')] || '').trim(),
            engineSerialNo: (cols[headers.indexOf('engine serial no')] || '').trim(),
            engineShaftPower: (cols[headers.indexOf('engine shaft power')] || '').trim(),
            engineType: (cols[headers.indexOf('engine type')] || '').trim(),
            engineMounting: (cols[headers.indexOf('engine mounting')] || '').trim(),
            engineFuelUsed: (cols[headers.indexOf('engine fuel used')] || '').trim(),
            engineModel: (cols[headers.indexOf('engine model')] || '').trim(),
            compatible: (cols[headers.indexOf('compatible')] || '').trim(),
            status: (cols[headers.indexOf('status')] || '').trim(),
        };
    });
}

// Display vessel info based on search
function displayVesselInfo(vesselName) {
    const vessel = vesselData.find(item => item.vesselName.toLowerCase() === vesselName.toLowerCase());

    const vesselDisplayNameElement = document.getElementById('vessel_display_name');
    vesselDisplayNameElement.textContent = vesselName || "Unknown Vessel";

    if (vessel) {
        // Update compatibility status and vessel info dynamically
        const compatibleText = document.querySelector('.compatible_text h2');
        const statusText = document.querySelector('.compatible_text p');
        const greenIcon = document.querySelector('.green_icon');

        // Display compatibility information
        switch (vessel.compatible.toLowerCase()) {
            case "compatible":
                compatibleText.textContent = "Compatible for B100";
                compatibleText.style.color = "#35EA1E";
                greenIcon.style.backgroundColor = "#35EA1E";
                greenIcon.style.backgroundImage = "url('/images/check.png')";
                statusText.textContent = vessel.status || "---";
                break;

            case "incompatible":
                compatibleText.textContent = "Incompatible for B100";
                compatibleText.style.color = "#EA1E1E";
                greenIcon.style.backgroundColor = "#EA1E1E";
                greenIcon.style.backgroundImage = "url('/images/fault.png')";
                statusText.textContent = vessel.status || "---";
                break;

            case "unknown":
                compatibleText.textContent = "Compatibility Unknown";
                compatibleText.style.color = "#A9A9A9";
                greenIcon.style.backgroundColor = "#A9A9A9";
                greenIcon.style.backgroundImage = "url('/images/unknown.png')";
                statusText.textContent = "---";
                break;

            default:
                compatibleText.textContent = "Compatibility Unknown";
                compatibleText.style.color = "#A9A9A9";
                greenIcon.style.backgroundColor = "#A9A9A9";
                greenIcon.style.backgroundImage = "url('/images/unknown.png')";
                statusText.textContent = "---";
                break;
        }

        // Update vessel details dynamically
        document.querySelector('.dimensions_sec .details_box').innerHTML = `
            <p>Owner Name: ${vessel.ownerName || '---'}</p>
            <p>GT: ${vessel.gt || '---'}</p>
            <p>Length: ${vessel.length || '---'}</p>
            <p>Breadth: ${vessel.breadth || '---'}</p>
            <p>Depth: ${vessel.depth || '---'}</p>
            <p>Dead Weight: ${vessel.deadWeight || '---'}</p>
            <p>Year Built: ${vessel.yearBuilt || '---'}</p>
        `;

        document.querySelector('.engine_sec .details_box').innerHTML = `
            <p>Engine Brand: ${vessel.engineBrand || '---'}</p>
            <p>Engine Serial No: ${vessel.engineSerialNo || '---'}</p>
            <p>Engine Shaft Power: ${vessel.engineShaftPower || '---'}</p>
            <p>Engine Type: ${vessel.engineType || '---'}</p>
            <p>Engine Mounting: ${vessel.engineMounting || '---'}</p>
            <p>Engine Fuel Used: ${vessel.engineFuelUsed || '---'}</p>
            <p>Engine Model: ${vessel.engineModel || '---'}</p>
        `;
    } else {
        alert("Vessel information not found. Please check the vessel name.");
    }
}

// Auto-suggestion feature for the search box
document.getElementById('search_input').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const vesselSelect = document.getElementById('vessel_select').value;
    const suggestionsList = document.getElementById('suggestions_list');

    if (query === '') {
        suggestionsList.style.display = 'none';
        return;
    }

    let filteredData = [];

    if (vesselSelect === 'vessel_name') {
        filteredData = vesselData.filter(item => item.vesselName.toLowerCase().startsWith(query));
    } else if (vesselSelect === 'owner_name' && ownerNameIndex !== -1) {
        const seenOwners = new Set();
        filteredData = vesselData.filter(item => {
            const ownerNameLower = item.ownerName.toLowerCase();
            if (!seenOwners.has(ownerNameLower) && ownerNameLower.startsWith(query)) {
                seenOwners.add(ownerNameLower);
                return true;
            }
            return false;
        });
    }

    filteredData.sort((a, b) => {
        const nameA = vesselSelect === 'vessel_name' ? a.vesselName : a.ownerName;
        const nameB = vesselSelect === 'vessel_name' ? b.vesselName : b.ownerName;
        return nameA.localeCompare(nameB);
    });

    const suggestions = filteredData.slice(0, 6);

    suggestionsList.innerHTML = '';
    suggestions.forEach(item => {
        const li = document.createElement('li');
        li.textContent = vesselSelect === 'vessel_name' ? item.vesselName : item.ownerName;
        li.addEventListener('click', function() {
            document.getElementById('search_input').value = li.textContent;
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
        });
        suggestionsList.appendChild(li);
    });

    suggestionsList.style.display = 'block';
});

// Search button functionality
document.querySelector('.search_btn').addEventListener('click', function() {
    const searchInput = document.getElementById('search_input').value.trim();
    const vesselSelect = document.getElementById('vessel_select').value;

    if (searchInput) {
        if (vesselSelect === 'vessel_name') {
            // Navigate to vessel information page
            window.location.href = `/pages/vessel.html?vessel=${encodeURIComponent(searchInput)}`;
        } else if (vesselSelect === 'owner_name') {
            // Navigate to owner vessels page
            window.location.href = `/pages/owner_vessel.html?owner=${encodeURIComponent(searchInput)}`;
        }
    } else {
        alert('Please enter a valid vessel or owner name.');
    }
});

// Close suggestions list when clicking outside
document.addEventListener('click', function(event) {
    const suggestionsList = document.getElementById('suggestions_list');
    const searchInput = document.getElementById('search_input');

    if (suggestionsList.style.display === 'block' && !searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = 'none';
    }
});

// Stop event propagation on input or suggestion list click
document.getElementById('search_input').addEventListener('click', function(event) {
    event.stopPropagation();
});
document.getElementById('suggestions_list').addEventListener('click', function(event) {
    event.stopPropagation();
});

// Load data when the page loads
window.onload = loadVesselData;
