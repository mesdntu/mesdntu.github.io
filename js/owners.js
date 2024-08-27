let ownerData = {}; // Store the parsed CSV data for owners and vessels
let currentPage = 1; // Keep track of the current page
const ownersPerPage = 8; // Number of owners to display per page
let totalPages = 1;
let alphabetSortedOwners = {}; // Store owners grouped by first letter

// Load the data and initialize the search and pagination functionality
async function loadOwnerData() {
    try {
        const response = await fetch('/data/B100 data.csv'); // Adjust path as needed
        const text = await response.text();
        ownerData = parseOwnerCSV(text);
        totalPages = Math.ceil(ownerData.ownerArray.length / ownersPerPage);
        renderPage(currentPage); // Render the first page
        renderPagination(); // Render pagination buttons
        groupOwnersByAlphabet(); // Prepare the alphabetized list for sidebar
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}

// Parse the CSV and extract unique owners, vessel names, and vessel counts
function parseOwnerCSV(text) {
    const rows = text.split('\n');
    const ownerCountMap = {}; // Store owner name and their vessel count
    const vesselData = []; // Store vessel and owner data

    rows.slice(1).forEach(row => {
        const cols = row.split(',');
        const vesselName = cols[1]?.trim(); // Assuming second column is the vessel name
        const ownerName = cols[cols.length - 1]?.trim(); // Get the last column (Owner Name)

        if (ownerName) {
            if (!ownerCountMap[ownerName]) {
                ownerCountMap[ownerName] = 0;
            }
            ownerCountMap[ownerName] += 1; // Count the occurrences of each owner
        }

        if (vesselName && ownerName) {
            vesselData.push({ vesselName, ownerName });
        }
    });

    // Convert the object to an array and sort alphabetically by owner name
    const ownerArray = Object.entries(ownerCountMap).map(([ownerName, vesselCount]) => ({
        ownerName,
        vesselCount
    }));

    // Combine ownerArray and vesselData into one dataset for searching
    return {
        ownerArray: ownerArray.sort((a, b) => a.ownerName.localeCompare(b.ownerName)),
        vesselData: vesselData.sort((a, b) => a.vesselName.localeCompare(b.vesselName))
    };
}

// Group owners by their starting alphabet for the sidebar functionality
function groupOwnersByAlphabet() {
    alphabetSortedOwners = {};

    ownerData.ownerArray.forEach(owner => {
        const firstLetter = owner.ownerName.charAt(0).toUpperCase();
        if (!alphabetSortedOwners[firstLetter]) {
            alphabetSortedOwners[firstLetter] = [];
        }
        alphabetSortedOwners[firstLetter].push(owner);
    });
}

// Render the current page of owners
function renderPage(page) {
    const start = (page - 1) * ownersPerPage;
    const end = start + ownersPerPage;
    const ownersToShow = ownerData.ownerArray.slice(start, end);

    const ownersList = document.getElementById('owners_list');
    ownersList.innerHTML = ''; // Clear previous entries

    ownersToShow.forEach(owner => {
        const ownerItem = document.createElement('div');
        ownerItem.className = 'owner_item';
        ownerItem.innerHTML = `
            <div class="owner_name">${owner.ownerName}</div>
            <button class="vessel_btn">${owner.vesselCount} ${owner.vesselCount === 1 ? 'Vessel' : 'Vessels'}</button>
        `;
        ownersList.appendChild(ownerItem);

        // Add separator line after each owner
        const hr = document.createElement('hr');
        ownersList.appendChild(hr);
    });

    // Render the pagination buttons
    renderPagination();
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

// Implement the autocomplete functionality for search input
document.getElementById('search_input').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const vesselSelect = document.getElementById('vessel_select').value;  // Check user selection
    const suggestionsList = document.getElementById('suggestions_list');

    // If the input is empty, hide the suggestion box
    if (query === '') {
        suggestionsList.style.display = 'none';
        return;
    }

    let filteredData = [];

    // Check which type of data to filter based on user selection
    if (vesselSelect === 'vessel_name') {
        // Recommend based on Vessel Name
        filteredData = ownerData.vesselData.filter(item => item.vesselName && item.vesselName.toLowerCase().startsWith(query));
    } else if (vesselSelect === 'owner_name') {
        // Recommend based on Owner Name
        filteredData = ownerData.ownerArray.filter(item => item.ownerName.toLowerCase().startsWith(query));
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
document.addEventListener('click', function(event) {
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

// Function to navigate back to the search page
function goBack() {
    window.location.href = 'searchpage.html'; // Navigate back to searchpage.html
}

// Load the CSV data on page load
window.onload = function() {
    loadOwnerData(); // Load owner data and initialize the page

    // Implement the alphabet sidebar click events
    document.querySelectorAll('.alphabet_sidebar div').forEach(letterDiv => {
        const letter = letterDiv.textContent.trim();
        letterDiv.addEventListener('click', () => handleAlphabetClick(letter));
    });
};
