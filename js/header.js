document.addEventListener('DOMContentLoaded', function() {
    let headerData = [];
    window.tooltip = null;

    async function loadData() {
        try {
            const response = await fetch('/data/B100 data.csv');
            const text = await response.text();
            headerData = parseCSV(text);
        } catch (error) {
            console.error('Error loading CSV data:', error);
        }
    }

    function parseCSV(text) {
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
                vesselName: (cols[vesselNameIndex] || '').trim(),
                ownerName: (cols[ownerNameIndex] || '').trim()
            };
        });
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
            filteredData = headerData.filter(item => item.vesselName.toLowerCase().includes(query));
        } else if (vesselSelect === 'owner_name') {
            const seenOwners = new Set();
            filteredData = headerData.filter(item => {
                const ownerNameLower = item.ownerName.toLowerCase();
                if (!seenOwners.has(ownerNameLower) && ownerNameLower.includes(query)) {
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

    window.searchVessel = function() {
        const searchInput = document.getElementById('search_input').value.trim();
        const vesselSelect = document.getElementById('vessel_select').value;

        if (searchInput) {
            if (vesselSelect === 'vessel_name') {
                window.location.href = `/pages/vessel.html?vessel=${encodeURIComponent(searchInput)}`;
            } else if (vesselSelect === 'owner_name') {
                window.location.href = `/pages/owner_vessel.html?owner=${encodeURIComponent(searchInput)}`;
            }
        } else {
            alert('Please input a valid vessel or owner name.');
        }
    };

    window.tooltip = document.querySelector('.question_tip');
    window.tooltip.addEventListener('click', function(event) {
        this.classList.add('clicked');
        event.stopPropagation();
    });

    document.addEventListener('click', function() {
        window.tooltip.classList.remove('clicked');
    });

    loadData();
});

console.log("header.js loaded and searchVessel function is defined.");

function goBack() {
    window.history.back();
}
