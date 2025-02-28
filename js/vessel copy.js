let vesselData = []; // Store the parsed CSV data for vessels

// Load the data and initialize the search and page functionality
async function loadVesselData() {
    try {
        const response = await fetch('/data/B100 data.csv'); // Adjust path as needed
        const text = await response.text();
        vesselData = parseVesselCSV(text);
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}

// Parse the CSV data to extract vessel information
function parseVesselCSV(text) {
    const rows = text.split('\n');
    const headers = rows[0].split(',').map(header => header.trim().toLowerCase());

    const vesselNameIndex = headers.indexOf('vessel name');
    const ownerNameIndex = headers.indexOf('owner name');

    if (vesselNameIndex === -1 || ownerNameIndex === -1) {
        console.error('Required columns not found');
        return [];
    }

    return rows.slice(1).map(row => {
        const cols = row.split(',');
        return {
            vesselName: cols[vesselNameIndex]?.trim(),
            ownerName: cols[ownerNameIndex]?.trim()
        };
    });
}

// Implement the autocomplete functionality for search input
document.getElementById('search_input').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const vesselSelect = document.getElementById('vessel_select').value; // Check user selection
    const suggestionsList = document.getElementById('suggestions_list');

    // If the input is empty, hide the suggestion box
    if (query === '') {
        suggestionsList.style.display = 'none';
        return;
    }

    let filteredData = [];

    // Filter based on user selection (vessel name or owner name)
    if (vesselSelect === 'vessel_name') {
        filteredData = vesselData.filter(item => item.vesselName?.toLowerCase().startsWith(query));
    } else if (vesselSelect === 'owner_name') {
        filteredData = vesselData.filter(item => item.ownerName?.toLowerCase().startsWith(query));
    }

    // Sort the filtered suggestions alphabetically
    filteredData.sort((a, b) => {
        const nameA = vesselSelect === 'vessel_name' ? a.vesselName : a.ownerName;
        const nameB = vesselSelect === 'vessel_name' ? b.vesselName : b.ownerName;
        return nameA.localeCompare(nameB);
    });

    // Show up to 6 suggestions
    const suggestions = filteredData.slice(0, 6);

    // Clear and re-render the suggestion list
    suggestionsList.innerHTML = '';
    suggestions.forEach(item => {
        const li = document.createElement('li');
        li.textContent = vesselSelect === 'vessel_name' ? item.vesselName : item.ownerName;
        li.addEventListener('click', function () {
            document.getElementById('search_input').value = li.textContent;
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none'; // Hide suggestions after selection
        });
        suggestionsList.appendChild(li);
    });

    // Display the suggestions list
    suggestionsList.style.display = 'block';
});

// Close suggestions when clicking outside
document.addEventListener('click', function (event) {
    const suggestionsList = document.getElementById('suggestions_list');
    const searchInput = document.getElementById('search_input');

    if (suggestionsList.style.display === 'block' && !searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = 'none';
    }
});

// Stop propagation when clicking inside the search box or suggestion list
document.getElementById('search_input').addEventListener('click', function (event) {
    event.stopPropagation();
});

document.getElementById('suggestions_list').addEventListener('click', function (event) {
    event.stopPropagation(); // Stop the event from bubbling up to other elements
});

// Handle the click event for "Click Here to Know More"
document.addEventListener('DOMContentLoaded', function () {
    const clickHereButton = document.querySelector('.click_here');
    
    clickHereButton.addEventListener('click', function () {
        alert("Redirecting to more information page...");
        // Implement redirection or additional functionality here
    });

    // Load vessel data on page load
    loadVesselData();
});
