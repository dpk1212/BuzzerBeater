// vault.js - Handles vault functionality using localStorage

// DOM elements
const vaultList = document.getElementById('vaultList');
const saveVaultBtn = document.getElementById('saveVaultBtn');

// Load vault from localStorage on page load
document.addEventListener('DOMContentLoaded', displayVault);

// Save message to vault
function saveToVault() {
    const message = document.getElementById('generatedMessage').textContent;
    if (message && message !== '') {
        let vault = JSON.parse(localStorage.getItem('messageVault') || '[]');
        // Limit to 10 messages in free version
        if (vault.length >= 10) {
            alert('Free version limit reached (10 messages). Upgrade to Premium for unlimited storage!');
            return;
        }
        vault.push(message);
        localStorage.setItem('messageVault', JSON.stringify(vault));
        displayVault();
        alert('Message saved to vault!');
    }
}

// Display vault messages
function displayVault() {
    const vault = JSON.parse(localStorage.getItem('messageVault') || '[]');
    vaultList.innerHTML = ''; // Clear current list
    vault.forEach((msg, index) => {
        const li = document.createElement('li');
        li.textContent = msg;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteMessage(index));
        li.appendChild(deleteBtn);
        vaultList.appendChild(li);
    });
}

// Delete a message from the vault
function deleteMessage(index) {
    let vault = JSON.parse(localStorage.getItem('messageVault') || '[]');
    vault.splice(index, 1);
    localStorage.setItem('messageVault', JSON.stringify(vault));
    displayVault();
}

// Warning: localStorage is client-side and private to each user’s browser, ensuring privacy as specified.
