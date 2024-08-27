let data = []; // 存储CSV数据的数组
let ownerNameIndex = -1; // 存储"Owner Name"列的索引

// 加载header.html和header.css函数
function loadHeader() {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            loadHeaderCSS(); // 加载header样式
            loadData(); // 加载CSV数据
            initializeSearch(); // 初始化搜索相关事件监听器
        })
        .catch(error => console.error('Error loading the header:', error));
}

function loadHeaderCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'header.css';
    document.head.appendChild(link);
}

// 加载CSV数据函数
async function loadData() {
    try {
        const response = await fetch('/data/B100 data.csv'); // 根据需要调整路径
        const text = await response.text();
        data = parseCSV(text);
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}

// 解析CSV的函数，并找到"Owner Name"列的索引
function parseCSV(text) {
    const rows = text.split('\n');
    const headers = rows[0].split(',').map(header => header.trim().toLowerCase());

    // 找到"Owner Name"列的索引（忽略大小写和前后空格）
    ownerNameIndex = headers.indexOf('owner name');

    if (ownerNameIndex === -1) {
        console.error('Owner Name列未找到');
        return [];
    }

    // 跳过标题行，并解析数据
    return rows.slice(1).map(row => {
        const cols = row.split(',');
        return {
            vesselName: (cols[1] || '').trim(),  // 你可以根据需要调整Vessel Name列的索引
            ownerName: (cols[ownerNameIndex] || '').trim()  // 根据Owner Name列的索引来取值
        };
    });
}

// 初始化搜索框事件监听器
function initializeSearch() {
    const searchInput = document.getElementById('search_input');
    const vesselSelect = document.getElementById('vessel_select');
    const suggestionsList = document.getElementById('suggestions_list');

    // 监听输入事件以实现自动补全功能
    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const selection = vesselSelect.value;  // 检查用户选择

        // 如果输入为空，隐藏推荐框
        if (query === '') {
            suggestionsList.style.display = 'none';
            return;
        }

        let filteredData = [];

        // 根据用户选择决定推荐数据源
        if (selection === 'vessel_name') {
            filteredData = data.filter(item => item.vesselName.toLowerCase().startsWith(query));
        } else if (selection === 'owner_name' && ownerNameIndex !== -1) {
            filteredData = data.filter(item => item.ownerName.toLowerCase().startsWith(query));
        }

        // 按字母排序推荐
        filteredData.sort((a, b) => {
            const nameA = selection === 'vessel_name' ? a.vesselName : a.ownerName;
            const nameB = selection === 'vessel_name' ? b.vesselName : b.ownerName;
            return nameA.localeCompare(nameB);
        });

        // 显示最多6个建议
        const suggestions = filteredData.slice(0, 6);

        // 清空并重新渲染建议列表
        suggestionsList.innerHTML = ''; // 清空之前的建议
        suggestions.forEach(item => {
            const li = document.createElement('li');
            li.textContent = selection === 'vessel_name' ? item.vesselName : item.ownerName;
            li.addEventListener('click', function () {
                searchInput.value = li.textContent;
                suggestionsList.innerHTML = ''; // 清空建议
                suggestionsList.style.display = 'none'; // 隐藏建议框
            });
            suggestionsList.appendChild(li);
        });

        // 显示推荐框
        suggestionsList.style.display = 'block';
    });

    // 添加点击事件以关闭推荐框
    document.addEventListener('click', function (event) {
        if (suggestionsList.style.display === 'block' && !searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.style.display = 'none';
        }
    });

    // 阻止点击推荐框或搜索框时触发页面的点击事件
    searchInput.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    suggestionsList.addEventListener('click', function (event) {
        event.stopPropagation();
    });
}

// 页面加载时调用 loadHeader
window.onload = loadHeader;
