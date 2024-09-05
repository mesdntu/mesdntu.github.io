let ownerData = {};
let currentPage = 1;
const ownersPerPage = 8;
let totalPages = 1;
let alphabetSortedOwners = {};

async function loadOwnerData() {
    try {
        const response = await fetch('/data/B100 data.csv');
        const text = await response.text();
        ownerData = parseOwnerCSV(text);
        totalPages = Math.ceil(ownerData.ownerArray.length / ownersPerPage);
        renderPage(currentPage);
        renderPagination();
        groupOwnersByAlphabet();
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}

function parseOwnerCSV(text) {
    const rows = text.split('\n');
    const ownerCountMap = {};
    const vesselData = [];

    rows.slice(1).forEach(row => {
        const cols = row.split(',');
        const vesselName = cols[1]?.trim();
        const ownerName = cols[cols.length - 1]?.trim();

        if (ownerName) {
            if (!ownerCountMap[ownerName]) {
                ownerCountMap[ownerName] = 0;
            }
            ownerCountMap[ownerName] += 1;
        }

        if (vesselName && ownerName) {
            vesselData.push({ vesselName, ownerName });
        }
    });

    const ownerArray = Object.entries(ownerCountMap).map(([ownerName, vesselCount]) => ({
        ownerName,
        vesselCount
    }));

    return {
        ownerArray: ownerArray.sort((a, b) => a.ownerName.localeCompare(b.ownerName)),
        vesselData: vesselData.sort((a, b) => a.vesselName.localeCompare(b.vesselName))
    };
}

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

function renderPage(page) {
    const start = (page - 1) * ownersPerPage;
    const end = start + ownersPerPage;
    const ownersToShow = ownerData.ownerArray.slice(start, end);

    const ownersList = document.getElementById('owners_list');
    ownersList.innerHTML = '';

    ownersToShow.forEach(owner => {
        const ownerItem = document.createElement('div');
        ownerItem.className = 'owner_item';
        ownerItem.innerHTML = `
            <div class="owner_name">${owner.ownerName}</div>
            <button class="vessel_btn" onclick="redirectToOwnerVessel('${owner.ownerName}')">${owner.vesselCount} ${owner.vesselCount === 1 ? 'Vessel' : 'Vessels'}</button>
        `;
        ownersList.appendChild(ownerItem);

        const hr = document.createElement('hr');
        ownersList.appendChild(hr);
    });

    renderPagination();
}

function redirectToOwnerVessel(ownerName) {
    window.location.href = `/pages/owner_vessel.html?owner=${encodeURIComponent(ownerName)}`;
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

document.getElementById('search_input').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const vesselSelect = document.getElementById('vessel_select').value;
    const suggestionsList = document.getElementById('suggestions_list');

    if (query === '') {
        suggestionsList.style.display = 'none';
        return;
    }

    let filteredData = [];

    if (vesselSelect === 'vessel_name') {
        filteredData = ownerData.vesselData.filter(item => item.vesselName && item.vesselName.toLowerCase().startsWith(query));
    } else if (vesselSelect === 'owner_name') {
        filteredData = ownerData.ownerArray.filter(item => item.ownerName.toLowerCase().startsWith(query));
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
        li.addEventListener('click', function () {
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

document.getElementById('search_input').addEventListener('click', function (event) {
    event.stopPropagation();
});

document.getElementById('suggestions_list').addEventListener('click', function (event) {
    event.stopPropagation();
});

function goBack() {
    window.location.href = 'searchpage.html';
}

window.onload = function() {
    loadOwnerData();

    document.querySelectorAll('.alphabet_sidebar div').forEach(letterDiv => {
        const letter = letterDiv.textContent.trim();
        letterDiv.addEventListener('click', () => handleAlphabetClick(letter));
    });
};
