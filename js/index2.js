document.querySelectorAll('.FAQ1, .FAQ2, .FAQ3').forEach(item => {
    item.addEventListener('click', function() {
        this.classList.toggle('active');
        
        // Remove max-height after animation ends to allow for content resizing
        const answer = this.querySelector('.answer');
        if (this.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
            answer.style.maxHeight = '0';
        }
    });
});
// 定义要观察的目标元素
const sections = document.querySelectorAll('.core_features, .FAQ, .discover_more');

// 设置Intersection Observer的选项
const options = {
    threshold: 0.1 // 当section进入视口10%时触发
};

// 创建Intersection Observer实例
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            observer.unobserve(entry.target); // 只触发一次
        }
    });
}, options);

// 观察每个section
sections.forEach(section => {
    section.classList.add('section'); // 添加初始的隐藏类
    observer.observe(section);
});
document.getElementById('loginBtn').addEventListener('click', function() {
    // 获取用户输入的账号和密码
    const account = document.getElementById('account').value;
    const password = document.getElementById('password').value;

    // 预定义的正确账号和密码
    const correctAccount = 'mesd-b100';
    const correctPassword = '202412345678';

    // 检查账号和密码是否正确
    if (account === correctAccount && password === correctPassword) {
        // 如果正确，跳转到指定页面
        window.location.href = '/pages/searchpage.html';
    } else {
        // 如果不正确，显示错误消息
        const errorMessage = document.getElementById('error_message');
        errorMessage.style.display = 'block';
    }
});
