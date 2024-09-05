let headerData = []; 
let currentPage = 1; 
const vesselsPerPage = 8; 
let totalPages = 1;
let headerOwnerNameIndex = -1; 
let currentPrefix = ''; 


async function loadHeaderData() {
    try {
        const response = await fetch('/data/B100 data.csv');
        const text = await response.text();
        headerData = parseHeaderCSV(text);
        totalPages = Math.ceil(headerData.length / vesselsPerPage);
        renderPage(currentPage); 
        renderPagination(); 
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}
function searchVessel() {
    const searchInput = document.getElementById('search_input').value.trim();
    const vesselSelect = document.getElementById('vessel_select').value;


    if (searchInput) {

        if (vesselSelect === 'vessel_name') {
            window.location.href = `/pages/vessel.html?vessel=${encodeURIComponent(searchInput)}`;
        } 

        else if (vesselSelect === 'owner_name') {
            window.location.href = `/pages/vessel.html?owner=${encodeURIComponent(searchInput)}`;
        }
    } else {
        alert('Please input a valid vessel or owner name.');
    }
}

function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

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

function renderPage(page) {
    const start = (page - 1) * vesselsPerPage;
    const end = start + vesselsPerPage;
    const vesselsToShow = headerData.slice(start, end);

    const vesselList = document.getElementById('vessel_list');
    vesselList.innerHTML = ''; 

    vesselsToShow.forEach(vessel => {
        const vesselItem = document.createElement('div');
        vesselItem.className = 'vessel_item';
        vesselItem.innerHTML = `
            <div class="vessel_name">${vessel.vesselName}</div>
            <button class="vessel_btn" onclick="goToVesselPage('${vessel.vesselName}')">Click Here</button>
        `;
        vesselList.appendChild(vesselItem);

        const hr = document.createElement('hr');
        vesselList.appendChild(hr);
    });

    renderPagination();
}

function goToVesselPage(vesselName) {
    const encodedVesselName = encodeURIComponent(vesselName);
    window.location.href = `/pages/vessel.html?vessel=${encodedVesselName}`;
}

function renderPagination() {
    const paginationContainer = document.getElementById('page_num');
    paginationContainer.innerHTML = ''; 

    const paginationButtons = [];
    const maxVisiblePages = 4; 


    paginationButtons.push(createPageButton(1));


    let startPage = Math.max(2, currentPage - 1); 
    let endPage = Math.min(totalPages - 1, currentPage + 1); 

    if (currentPage <= 3) {
        startPage = 2;
        endPage = Math.min(5, totalPages - 1);
    } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(totalPages - 4, 2);
        endPage = totalPages - 1;
    }

    if (startPage > 2) {
        paginationButtons.push(createEllipsis());
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationButtons.push(createPageButton(i));
    }

    if (endPage < totalPages - 1) {
        paginationButtons.push(createEllipsis());
    }

    if (totalPages > 1) {
        paginationButtons.push(createPageButton(totalPages));
    }

    paginationButtons.forEach(button => paginationContainer.appendChild(button));
}

function createPageButton(page) {
    const pageButton = document.createElement('button');
    pageButton.textContent = page;
    pageButton.className = 'pagination_button';
    if (page === currentPage) {
        pageButton.classList.add('active'); 
    }
    pageButton.addEventListener('click', () => {
        currentPage = page;
        renderPage(currentPage); 
    });
    return pageButton;
}

function createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    ellipsis.className = 'pagination_ellipsis';
    return ellipsis;
}

function updateContentBasedOnPrefix() {
    const prefixTitle = document.getElementById('prefix_title');
    currentPrefix = getQueryParameter('prefix');

    prefixTitle.textContent = `${currentPrefix} Prefix Collection`;

    loadHeaderData();
}

function jumpToLetter(letter) {

    const vesselIndex = headerData.findIndex(vessel => vessel.vesselName.startsWith(letter));

    if (vesselIndex !== -1) {
        const pageNumber = Math.floor(vesselIndex / vesselsPerPage) + 1;
        currentPage = pageNumber;
        renderPage(currentPage); 
    }
}

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
        filteredData = headerData.filter(item => item.vesselName.toLowerCase().startsWith(query));
    } else if (vesselSelect === 'owner_name' && headerOwnerNameIndex !== -1) {

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


document.addEventListener('click', function(event) {
    const suggestionsList = document.getElementById('suggestions_list');
    const searchInput = document.getElementById('search_input');

    if (suggestionsList.style.display === 'block' && !searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = 'none';
    }
});

document.getElementById('search_input').addEventListener('click', function(event) {
    event.stopPropagation();
});

document.getElementById('suggestions_list').addEventListener('click', function(event) {
    event.stopPropagation();
});


function goBack() {
    window.location.href = 'searchpage.html'; 
}


window.onload = function() {
    updateContentBasedOnPrefix(); 

    const alphabetLetters = document.querySelectorAll('.alphabet_sidebar div');
    alphabetLetters.forEach(letterDiv => {
        const letter = letterDiv.textContent.trim();
        letterDiv.addEventListener('click', () => jumpToLetter(letter));
    });
};
