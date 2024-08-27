let headerData = []; // Store the parsed CSV data
let currentPage = 1; // Keep track of the current page
const vesselsPerPage = 8; // Number of vessels to display per page
let totalPages = 1;
let headerOwnerNameIndex = -1; // Index for "Owner Name"
let currentPrefix = ''; // Store the current prefix

// Load the data and initialize the search and pagination functionality
async function loadHeaderData() {
    try {
        const response = await fetch('/data/B100 data.csv'); // Adjust path as needed
        const text = await response.text();
        headerData = parseHeaderCSV(text);
        totalPages = Math.ceil(headerData.length / vesselsPerPage);
        renderPage(currentPage); // Render the first page
        renderPagination(); // Render pagination buttons
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}
function searchVessel() {
    const searchInput = document.getElementById('search_input').value.trim();
    const vesselSelect = document.getElementById('vessel_select').value;

    // 确保输入框中有内容
    if (searchInput) {
        // 如果用户选择了船只名称
        if (vesselSelect === 'vessel_name') {
            window.location.href = `/pages/vessel.html?vessel=${encodeURIComponent(searchInput)}`;
        } 
        // 如果用户选择了船主名称
        else if (vesselSelect === 'owner_name') {
            window.location.href = `/pages/vessel.html?owner=${encodeURIComponent(searchInput)}`;
        }
    } else {
        alert('Please input a valid vessel or owner name.');
    }
}

// Get the URL parameter (prefix in this case)
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Parse the CSV and filter by prefix
function parseHeaderCSV(text) {
    const rows = text.split('\n');
    const headers = rows[0].split(',').map(header => header.trim().toLowerCase());

    const prefixIndex = headers.indexOf('prefix');
    const vesselNameIndex = headers.indexOf('vessel name');
    headerOwnerNameIndex = headers.indexOf('owner name');

    if (prefixIndex === -1 || vesselNameIndex === -1 || headerOwnerNameIndex === -1) {
        console.error('Required columns not found');
        return [];
    }

    // Filter by the selected prefix and sort alphabetically by vessel name
    return rows.slice(1)
        .map(row => {
            const cols = row.split(',');
            return {
                prefix: cols[prefixIndex]?.trim(),
                vesselName: cols[vesselNameIndex]?.trim(),
                ownerName: cols[headerOwnerNameIndex]?.trim()
            };
        })
        .filter(item => item.prefix === currentPrefix)
        .sort((a, b) => a.vesselName.localeCompare(b.vesselName));
}

// Render the current page of vessels
function renderPage(page) {
    const start = (page - 1) * vesselsPerPage;
    const end = start + vesselsPerPage;
    const vesselsToShow = headerData.slice(start, end);

    const vesselList = document.getElementById('vessel_list');
    vesselList.innerHTML = ''; // Clear previous entries

    vesselsToShow.forEach(vessel => {
        const vesselItem = document.createElement('div');
        vesselItem.className = 'vessel_item';
        vesselItem.innerHTML = `
            <div class="vessel_name">${vessel.vesselName}</div>
            <button class="vessel_btn" onclick="goToVesselPage('${vessel.vesselName}')">Click Here</button>
        `;
        vesselList.appendChild(vesselItem);

        // Add separator line after each vessel
        const hr = document.createElement('hr');
        vesselList.appendChild(hr);
    });

    // Render the pagination buttons
    renderPagination();
}

// Navigate to vessel.html with the vessel name as a parameter
function goToVesselPage(vesselName) {
    const encodedVesselName = encodeURIComponent(vesselName);
    window.location.href = `/pages/vessel.html?vessel=${encodedVesselName}`;
}

// Render pagination buttons with ellipses for skipped pages
function renderPagination() {
    const paginationContainer = document.getElementById('page_num');
    paginationContainer.innerHTML = ''; // Clear previous pagination

    const paginationButtons = [];
    const maxVisiblePages = 4; // Number of middle pages to display

    // Always display the first page
    paginationButtons.push(createPageButton(1));

    // Determine start and end pages for middle part of pagination
    let startPage = Math.max(2, currentPage - 1); // Start page can't be less than 2
    let endPage = Math.min(totalPages - 1, currentPage + 1); // End page can't be more than totalPages - 1

    // Adjust start and end if we're too close to the edges
    if (currentPage <= 3) {
        startPage = 2;
        endPage = Math.min(5, totalPages - 1);
    } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(totalPages - 4, 2);
        endPage = totalPages - 1;
    }

    // If there's a gap between the first page and the start page, show an ellipsis
    if (startPage > 2) {
        paginationButtons.push(createEllipsis());
    }

    // Generate the page buttons for the middle range
    for (let i = startPage; i <= endPage; i++) {
        paginationButtons.push(createPageButton(i));
    }

    // If there's a gap between the end page and the last page, show an ellipsis
    if (endPage < totalPages - 1) {
        paginationButtons.push(createEllipsis());
    }

    // Always display the last page if there are more than 1 page
    if (totalPages > 1) {
        paginationButtons.push(createPageButton(totalPages));
    }

    // Append the buttons to the pagination container
    paginationButtons.forEach(button => paginationContainer.appendChild(button));
}

// Create a page button with the page number
function createPageButton(page) {
    const pageButton = document.createElement('button');
    pageButton.textContent = page;
    pageButton.className = 'pagination_button';
    if (page === currentPage) {
        pageButton.classList.add('active'); // Highlight the current page
    }
    pageButton.addEventListener('click', () => {
        currentPage = page;
        renderPage(currentPage); // Render the selected page
    });
    return pageButton;
}

// Create an ellipsis
function createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    ellipsis.className = 'pagination_ellipsis';
    return ellipsis;
}

// Update the page content based on the prefix parameter
function updateContentBasedOnPrefix() {
    const prefixTitle = document.getElementById('prefix_title');
    currentPrefix = getQueryParameter('prefix');

    // Update title based on the current prefix
    prefixTitle.textContent = `${currentPrefix} Prefix Collection`;

    // Reload data with the filtered prefix
    loadHeaderData();
}

// Jump to the page where the first vessel starts with the selected letter
function jumpToLetter(letter) {
    // Find the first vessel starting with the clicked letter
    const vesselIndex = headerData.findIndex(vessel => vessel.vesselName.startsWith(letter));

    // If a vessel with that letter exists, calculate the page and jump to it
    if (vesselIndex !== -1) {
        const pageNumber = Math.floor(vesselIndex / vesselsPerPage) + 1;
        currentPage = pageNumber;
        renderPage(currentPage);  // Render the selected page
    }
}

// Implement the autocomplete functionality for search input
document.getElementById('search_input').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const vesselSelect = document.getElementById('vessel_select').value;  // Check user selection
    const suggestionsList = document.getElementById('suggestions_list');

    // If the input is empty, hide the suggestion box
    if (query === '') {
        suggestionsList.style.display = 'none';
        return;
    }

    let filteredData = [];

    // Filter based on user selection (vessel name or owner name)
    if (vesselSelect === 'vessel_name') {
        filteredData = headerData.filter(item => item.vesselName.toLowerCase().startsWith(query));
    } else if (vesselSelect === 'owner_name' && headerOwnerNameIndex !== -1) {
        // Avoid duplicate owner names
        const seenOwners = new Set();
        filteredData = headerData.filter(item => {
            const isDuplicate = seenOwners.has(item.ownerName.toLowerCase());
            if (!isDuplicate && item.ownerName.toLowerCase().startsWith(query)) {
                seenOwners.add(item.ownerName.toLowerCase());
                return true;
            }
            return false;
        });
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
        li.addEventListener('click', function() {
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
document.addEventListener('click', function(event) {
    const suggestionsList = document.getElementById('suggestions_list');
    const searchInput = document.getElementById('search_input');

    if (suggestionsList.style.display === 'block' && !searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = 'none';
    }
});

// Stop propagation when clicking inside the search box or suggestion list
document.getElementById('search_input').addEventListener('click', function(event) {
    event.stopPropagation();
});

document.getElementById('suggestions_list').addEventListener('click', function(event) {
    event.stopPropagation();
});

// Function to navigate back to the search page
function goBack() {
    window.location.href = 'searchpage.html'; // Navigate back to searchpage.html
}

// Initialize the content based on the prefix from the URL
window.onload = function() {
    updateContentBasedOnPrefix(); // Set the prefix and load corresponding data

    // Add event listeners to alphabet sidebar letters
    const alphabetLetters = document.querySelectorAll('.alphabet_sidebar div');
    alphabetLetters.forEach(letterDiv => {
        const letter = letterDiv.textContent.trim();
        letterDiv.addEventListener('click', () => jumpToLetter(letter));
    });
};
