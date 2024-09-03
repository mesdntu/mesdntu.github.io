let data = []; // Store CSV data
let ownerNameIndex = -1; // Index for "Owner Name"

// Load CSV data function
async function loadData() {
    try {
        const response = await fetch('/data/B100 data.csv'); // Adjust path as needed
        const text = await response.text();
        data = parseCSV(text);
        fillOwnerBoxes(); // Call the function to fill owner boxes after loading CSV
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

// Randomly fill owner boxes
function fillOwnerBoxes() {
    const ownerGroups = document.querySelectorAll('.owner_box');

    // Count occurrences of each Owner Name
    const ownerCountMap = data.reduce((acc, item) => {
        const owner = item.ownerName;
        if (owner) {
            acc[owner] = (acc[owner] || 0) + 1;
        }
        return acc;
    }, {});

    // Get all Owner Names
    const allOwners = Object.keys(ownerCountMap);

    // Randomly select 12 unique Owner Names
    const selectedOwners = [];
    while (selectedOwners.length < 12 && allOwners.length > 0) {
        const randomIndex = Math.floor(Math.random() * allOwners.length);
        const selectedOwner = allOwners.splice(randomIndex, 1)[0]; // Randomly select and remove the owner
        selectedOwners.push(selectedOwner);
    }

    // Fill the owner_box elements with randomly selected Owner Names and vessel count
    selectedOwners.forEach((owner, index) => {
        const ownerBox = ownerGroups[index];
        const vesselCount = ownerCountMap[owner];
        
        // Fill p tag with owner name
        const ownerNameElement = ownerBox.querySelector('p');
        ownerNameElement.textContent = owner;

        // Fill owner_btn button with vessel count
        const ownerBtnElement = ownerBox.querySelector('.owner_btn');
        ownerBtnElement.textContent = `${vesselCount} ${vesselCount > 1 ? 'Vessels' : 'Vessel'}`;

        // Add click event listener to redirect to owner_vessel.html with the owner name
        ownerBtnElement.addEventListener('click', function() {
            window.location.href = `/pages/owner_vessel.html?owner=${encodeURIComponent(owner)}`;
        });
    });
}

// Load CSV data when the page loads
window.onload = loadData;


// Add event listeners to prefix boxes for redirection
document.querySelectorAll('.prefix_box').forEach(box => {
    box.addEventListener('click', function() {
        // Get the prefix text from the clicked box
        const prefix = this.querySelector('.prefix').textContent.trim();

        // Redirect to prefix.html with the selected prefix as a URL parameter
        window.location.href = `/pages/prefix.html?prefix=${encodeURIComponent(prefix)}`;
    });
});

// Load CSV data when the page loads
window.onload = function() {
    loadData();
    
    // Ensure the prefix boxes have click listeners
    document.querySelectorAll('.prefix_box').forEach(box => {
        box.addEventListener('click', function() {
            const prefix = this.querySelector('.prefix').textContent.trim();
            window.location.href = `/pages/prefix.html?prefix=${encodeURIComponent(prefix)}`;
        });
    });
};

// Load CSV data when the page loads
window.onload = loadData;
