document.addEventListener('DOMContentLoaded', function () {
    // 获取 sidebar 的目标类型，可能是 "vessel" 或 "owner"
    const sidebar = document.querySelector('.alphabet_scrollbar');
    const targetType = sidebar.getAttribute('data-target-type'); // 'vessel' or 'owner'
    
    // 为字母条中的每个字母添加点击事件监听器
    const alphabetLetters = document.querySelectorAll('.alphabet_scrollbar div');
    alphabetLetters.forEach(letterDiv => {
        const letter = letterDiv.textContent.trim(); // 获取点击的字母
        letterDiv.addEventListener('click', () => jumpToLetter(letter, targetType)); // 点击字母时执行跳转
    });
});

// 根据目标类型 (vessel 或 owner) 进行跳转
function jumpToLetter(letter, targetType) {
    let itemIndex;

    // 根据 targetType 是 'vessel' 还是 'owner' 进行过滤
    if (targetType === 'vessel') {
        itemIndex = headerData.findIndex(item => item.vesselName.startsWith(letter));
    } else if (targetType === 'owner') {
        itemIndex = headerData.findIndex(item => item.ownerName.startsWith(letter));
    }

    // 如果找到匹配的项，计算应该跳转到的页面并重新渲染页面
    if (itemIndex !== -1) {
        const pageNumber = Math.floor(itemIndex / vesselsPerPage) + 1;
        currentPage = pageNumber;
        renderPage(currentPage);  // 渲染对应的页面
    }
}
