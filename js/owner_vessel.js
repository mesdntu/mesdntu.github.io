let vesselData = []; // 存储解析后的CSV数据

// 加载特定Owner的vessel数据
async function loadVesselDataForOwner(ownerName) {
    try {
        const response = await fetch('/data/B100 data.csv'); // 需要根据实际路径调整
        const text = await response.text();
        vesselData = parseCSV(text).filter(item => item.ownerName.toLowerCase() === ownerName.toLowerCase());

        // 按vessel name字母顺序排序
        vesselData.sort((a, b) => a.vesselName.localeCompare(b.vesselName));

        // 渲染vessel列表
        renderVesselList();
    } catch (error) {
        console.error('Error loading vessel data:', error);
    }
}

// 解析CSV文件内容
function parseCSV(text) {
    const rows = text.split('\n');
    return rows.slice(1).map(row => {
        const cols = row.split(',');
        return {
            vesselName: (cols[1] || '').trim(), // 假设第二列是vessel name
            ownerName: (cols[cols.length - 1] || '').trim() // 假设最后一列是owner name
        };
    });
}

// 渲染vessel列表到UI中
function renderVesselList() {
    const vesselListContainer = document.getElementById('vessel_list');
    vesselListContainer.innerHTML = ''; // 清空已有内容

    vesselData.forEach(vessel => {
        const vesselItem = document.createElement('div');
        vesselItem.className = 'vessel_item';
        vesselItem.innerHTML = `
            <div class="vessel_name">${vessel.vesselName}</div>
            <button class="vessel_btn" onclick="redirectToVesselPage('${vessel.vesselName}')">Click Here</button>
        `;
        vesselListContainer.appendChild(vesselItem);

        // 在每个vessel项后添加分隔线
        const hr = document.createElement('hr');
        vesselListContainer.appendChild(hr);
    });
}

// 实现跳转到vessel.html并传递vessel name参数
function redirectToVesselPage(vesselName) {
    window.location.href = `/pages/vessel.html?vessel=${encodeURIComponent(vesselName)}`;
}

// 实现自动补全和搜索功能
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
            searchVessel(); // 直接进行搜索
        });
        suggestionsList.appendChild(li);
    });

    suggestionsList.style.display = 'block';
});

// 搜索并跳转到vessel页面
function searchVessel() {
    const searchInput = document.getElementById('search_input').value.trim();
    if (searchInput) {
        redirectToVesselPage(searchInput);
    } else {
        alert('Please enter a valid vessel name.');
    }
}

// 点击外部时关闭推荐列表
document.addEventListener('click', function(event) {
    const suggestionsList = document.getElementById('suggestions_list');
    const searchInput = document.getElementById('search_input');

    if (suggestionsList.style.display === 'block' && !searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = 'none';
    }
});

// 阻止事件冒泡以保持推荐列表的显示
document.getElementById('search_input').addEventListener('click', function(event) {
    event.stopPropagation();
});
document.getElementById('suggestions_list').addEventListener('click', function(event) {
    event.stopPropagation();
});

// 页面加载时加载数据
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

// 返回到owners.html页面
function goBack() {
    window.history.back();
}
