let data = []; // Store CSV data
let ownerNameIndex = -1; // Index for "Owner Name"

// Load CSV data function
async function loadData() {
    try {
        const response = await fetch('/data/B100 data.csv'); // Adjust path as needed
        const text = await response.text();
        data = parseCSV(text);
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}

// Parse CSV function and find the index of "Owner Name" column
function parseCSV(text) {
    const rows = text.split('\n');
    const headers = rows[0].split(',').map(header => header.trim().toLowerCase());

    // Find "Owner Name" column index (ignore case and spaces)
    ownerNameIndex = headers.indexOf('owner name');
    
    if (ownerNameIndex === -1) {
        console.error('Owner Name column not found');
        return [];
    }

    // Skip the header row and parse the data
    return rows.slice(1).map(row => {
        const cols = row.split(',');
        return {
            vesselName: (cols[1] || '').trim(),  // Adjust index for Vessel Name as needed
            ownerName: (cols[ownerNameIndex] || '').trim()  // Get value from Owner Name column
        };
    });
}

// Listen for input events to implement autocomplete functionality
document.getElementById('search_input').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const vesselSelect = document.getElementById('vessel_select').value;  // Check user selection
    const suggestionsList = document.getElementById('suggestions_list');

    // If input is empty, hide suggestion box
    if (query === '') {
        suggestionsList.style.display = 'none';
        return;
    }

    let filteredData = [];

    // Filter data based on user selection
    if (vesselSelect === 'vessel_name') {
        // Recommend based on Vessel Name column
        filteredData = data.filter(item => item.vesselName.toLowerCase().startsWith(query));
    } else if (vesselSelect === 'owner_name' && ownerNameIndex !== -1) {
        // Recommend based on Owner Name column and remove duplicates
        const seenOwners = new Set();
        filteredData = data.filter(item => {
            const ownerNameLower = item.ownerName.toLowerCase();
            if (!seenOwners.has(ownerNameLower) && ownerNameLower.startsWith(query)) {
                seenOwners.add(ownerNameLower); // Track seen Owner Names
                return true;
            }
            return false;
        });
    }

    // Sort recommendations alphabetically
    filteredData.sort((a, b) => {
        const nameA = vesselSelect === 'vessel_name' ? a.vesselName : a.ownerName;
        const nameB = vesselSelect === 'vessel_name' ? b.vesselName : b.ownerName;
        return nameA.localeCompare(nameB);
    });

    // Show up to 6 suggestions
    const suggestions = filteredData.slice(0, 6);

    // Clear and re-render suggestions list
    suggestionsList.innerHTML = ''; // Clear previous suggestions
    suggestions.forEach(item => {
        const li = document.createElement('li');
        li.textContent = vesselSelect === 'vessel_name' ? item.vesselName : item.ownerName;
        li.addEventListener('click', function() {
            document.getElementById('search_input').value = li.textContent;
            suggestionsList.innerHTML = ''; // Clear suggestions
            suggestionsList.style.display = 'none'; // Hide suggestions box
        });
        suggestionsList.appendChild(li);
    });

    // Show suggestion box
    suggestionsList.style.display = 'block';
});

// Click event listener to close suggestion box
document.addEventListener('click', function(event) {
    const suggestionsList = document.getElementById('suggestions_list');
    const searchInput = document.getElementById('search_input');

    // If the suggestion box is visible and the click is outside the input or suggestion box, hide the suggestion box
    if (suggestionsList.style.display === 'block' && !searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = 'none';
    }
});

// Stop click event propagation when clicking inside the search input or suggestion list
document.getElementById('search_input').addEventListener('click', function(event) {
    event.stopPropagation();
});

document.getElementById('suggestions_list').addEventListener('click', function(event) {
    event.stopPropagation();
});

// Add event listeners to prefix boxes for redirection
document.querySelectorAll('.prefix_box').forEach(box => {
    box.addEventListener('click', function() {
        const prefix = this.querySelector('.prefix').textContent;
        // Redirect to prefix.html with the selected prefix as a URL parameter
        window.location.href = `/pages/prefix.html?prefix=${encodeURIComponent(prefix)}`;
    });
});

// Load CSV data when the page loads
window.onload = loadData;

function searchVessel() {
    const searchInput = document.getElementById('search_input').value.trim();
    const vesselSelect = document.getElementById('vessel_select').value;

    // 确保输入框中有值
    if (searchInput) {
        // 选择船名时跳转到vessel.html页面
        if (vesselSelect === 'vessel_name') {
            window.location.href = `/pages/vessel.html?vessel=${encodeURIComponent(searchInput)}`;
        } else if (vesselSelect === 'owner_name') {
            // 如果是Owner Name，可以根据你的需求设置跳转路径
            window.location.href = `/pages/vessel.html?owner=${encodeURIComponent(searchInput)}`;
        }
    } else {
        alert('Please input a valid vessel or owner name.');
    }
}

