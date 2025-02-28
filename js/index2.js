document.addEventListener('DOMContentLoaded', function() {
    const toggleFAQsBtn = document.querySelector('.see_more_btn');
    const extraFAQs = document.querySelector('.extra_FAQs');
    let isExpanded = false;

    toggleFAQsBtn.addEventListener('click', function() {
        if (isExpanded) {
            extraFAQs.style.display = 'none';
            toggleFAQsBtn.textContent = 'See More';
        } else {
            extraFAQs.style.display = 'block';
            toggleFAQsBtn.textContent = 'See Less';
        }
        isExpanded = !isExpanded;
    });

    document.querySelectorAll('.FAQ1, .FAQ2, .FAQ3, .FAQ4, .FAQ5, .FAQ6, .FAQ7, .FAQ8, .FAQ9, .FAQ10').forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('active');
            const answer = this.querySelector('.answer');
            if (this.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
        });
    });

    const sections = document.querySelectorAll('.core_features, .FAQ, .discover_more');
    const options = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    sections.forEach(section => {
        section.classList.add('section');
        observer.observe(section);
    });

    document.querySelector('.Rectangle_1').addEventListener('click', function() {
        const account = document.getElementById('account').value;
        const password = document.getElementById('password').value;
        const correctAccount = 'mesd-b100';
        const correctPassword = '202412345678';

        if (account === correctAccount && password === correctPassword) {
            window.location.href = '/pages/searchpage.html';
        } else {
            const errorMessage = document.getElementById('error_message');
            errorMessage.style.display = 'block';
        }
    });
});
