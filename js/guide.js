
function openModal(classification, category, requirements, approval) {
    document.getElementById('modal_title').textContent = classification;
    document.getElementById('modal_category').textContent = category;
    document.getElementById('modal_requirements').textContent = requirements;
    document.getElementById('modal_approval').textContent = approval;
    document.getElementById('modal').style.display = 'flex';
}


function closeModal() {
    document.getElementById('modal').style.display = 'none';
}


function goBack() {
    window.history.back();
}
