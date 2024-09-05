let vesselData = [];

async function loadVesselDataForOwner(ownerName) {
    try {
        const response = await fetch('/data/B100 data.csv');
        const text = await response.text();
        vesselData = parseCSV(text).filter(item => item.ownerName.toLowerCase() === ownerName.toLowerCase());
        vesselData.sort((a, b) => a.vesselName.localeCompare(b.vesselName));
        renderVesselList();
    } catch (error) {
        console.error('Error loading vessel data:', error);
    }
}

function parseCSV(text) {
    const rows = text.split('\n');
    return rows.slice(1).map(row => {
        const cols = row.split(',');
        return {
            vesselName: (cols[1] || '').trim(),
            ownerName: (cols[cols.length - 1] || '').trim()
        };
    });
}

function renderVesselList() {
    const vesselListContainer = document.getElementById('vessel_list');
    vesselListContainer.innerHTML = '';
    vesselData.forEach(vessel => {
        const vesselItem = document.createElement('div');
        vesselItem.className = 'vessel_item';
        vesselItem.innerHTML = `
            <div class="vessel_name">${vessel.vesselName}</div>
            <button class="vessel_btn" onclick="redirectToVesselPage('${vessel.vesselName}')">Click Here</button>
        `;
        vesselListContainer.appendChild(vesselItem);
        const hr = document.createElement('hr');
        vesselListContainer.appendChild(hr);
    });
}

function redirectToVesselPage(vesselName) {
    window.location.href = `/pages/vessel.html?vessel=${encodeURIComponent(vesselName)}`;
}

document.getElementById('search_input').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const suggestionsList = document.getElementById('suggestions_list');
    if (query === '') {
        suggestionsList.style.display = 'none';
        return;
    }
    let filteredData = vesselData.filter(item => item.vesselName.toLowerCase().startsWith(query));
    filteredData.sort((a, b) => a.vesselName.localeCompare(b.vesselName));
    const suggestions = filteredData.slice(0, 6);
    suggestionsList.innerHTML = '';
    suggestions.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.vesselName;
        li.addEventListener('click', function() {
            document.getElementById('search_input').value = li.textContent;
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
            searchVessel();
        });
        suggestionsList.appendChild(li);
    });
    suggestionsList.style.display = 'block';
});

function searchVessel() {
    const searchInput = document.getElementById('search_input').value.trim();
    if (searchInput) {
        redirectToVesselPage(searchInput);
    } else {
        alert('Please enter a valid vessel name.');
    }
}

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

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const ownerName = urlParams.get('owner');
    if (ownerName) {
        document.getElementById('owner_name').textContent = ownerName;
        loadVesselDataForOwner(ownerName);
    } else {
        alert('Owner name not found in URL parameters.');
    }
};

function goBack() {
    window.history.back();
}
