document.getElementById('loginButton').addEventListener('click', function() {
    const account = document.getElementById('account').value;
    const password = document.getElementById('password').value;

    if (account === 'mesd-b100' && password === '202412345678') {

        window.location.href = '/pages/searchpage.html';
    } else {

        alert('Incorrect account or password. Please try again.');
    }
});
