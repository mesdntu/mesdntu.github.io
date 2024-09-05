document.addEventListener('DOMContentLoaded', function() {
    // Handle FAQ expand/collapse
    const toggleFAQsBtn = document.querySelector('.see_more_btn');  // Select the button using class selector
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

    // Handle the FAQ item toggle for both the initial and extra FAQs
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

    // Observer to trigger section animations when they enter the viewport
    const sections = document.querySelectorAll('.core_features, .FAQ, .discover_more');
    const options = {
        threshold: 0.1 // Trigger when 10% of the section is in view
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, options);

    // Observe each section for animations
    sections.forEach(section => {
        section.classList.add('section'); // Add initial hidden class
        observer.observe(section);
    });

    // Login button logic
    document.querySelector('.Rectangle_1').addEventListener('click', function() {
        // Get user input
        const account = document.getElementById('account').value;
        const password = document.getElementById('password').value;

        // Predefined correct credentials
        const correctAccount = 'mesd-b100';
        const correctPassword = '202412345678';

        // Check if account and password are correct
        if (account === correctAccount && password === correctPassword) {
            // Redirect to search page if correct
            window.location.href = '/pages/searchpage.html';
        } else {
            // Show error message if incorrect
            const errorMessage = document.getElementById('error_message');
            errorMessage.style.display = 'block';
        }
    });
});
