let data = []; 
let ownerNameIndex = -1; 


async function loadData() {
    try {
        const response = await fetch('/data/B100 data.csv'); 
        const text = await response.text();
        data = parseCSV(text);
        fillOwnerBoxes(); 
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}

function parseCSV(text) {
    const rows = text.split('\n');
    const headers = rows[0].split(',').map(header => header.trim().toLowerCase());

    ownerNameIndex = headers.indexOf('owner name');
    
    if (ownerNameIndex === -1) {
        console.error('Owner Name column not found');
        return [];
    }

    return rows.slice(1).map(row => {
        const cols = row.split(',');
        return {
            vesselName: (cols[1] || '').trim(), 
            ownerName: (cols[ownerNameIndex] || '').trim()  
        };
    });
}


function fillOwnerBoxes() {
    const ownerGroups = document.querySelectorAll('.owner_box');


    const ownerCountMap = data.reduce((acc, item) => {
        const owner = item.ownerName;
        if (owner) {
            acc[owner] = (acc[owner] || 0) + 1;
        }
        return acc;
    }, {});

    const allOwners = Object.keys(ownerCountMap);

    const selectedOwners = [];
    while (selectedOwners.length < 12 && allOwners.length > 0) {
        const randomIndex = Math.floor(Math.random() * allOwners.length);
        const selectedOwner = allOwners.splice(randomIndex, 1)[0]; 
        selectedOwners.push(selectedOwner);
    }


    selectedOwners.forEach((owner, index) => {
        const ownerBox = ownerGroups[index];
        const vesselCount = ownerCountMap[owner];
        

        const ownerNameElement = ownerBox.querySelector('p');
        ownerNameElement.textContent = owner;


        const ownerBtnElement = ownerBox.querySelector('.owner_btn');
        ownerBtnElement.textContent = `${vesselCount} ${vesselCount > 1 ? 'Vessels' : 'Vessel'}`;

        
        ownerBtnElement.addEventListener('click', function() {
            window.location.href = `/pages/owner_vessel.html?owner=${encodeURIComponent(owner)}`;
        });
    });
}


window.onload = loadData;



document.querySelectorAll('.prefix_box').forEach(box => {
    box.addEventListener('click', function() {

        const prefix = this.querySelector('.prefix').textContent.trim();


        window.location.href = `/pages/prefix.html?prefix=${encodeURIComponent(prefix)}`;
    });
});


window.onload = function() {
    loadData();
    

    document.querySelectorAll('.prefix_box').forEach(box => {
        box.addEventListener('click', function() {
            const prefix = this.querySelector('.prefix').textContent.trim();
            window.location.href = `/pages/prefix.html?prefix=${encodeURIComponent(prefix)}`;
        });
    });
};


window.onload = loadData;
