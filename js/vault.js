// Vault management functionality
document.addEventListener('DOMContentLoaded', function() {
    // Vault elements
    const vaultContainer = document.getElementById('vault-container');
    const savedCount = document.getElementById('saved-count');
    const emptyVault = document.getElementById('empty-vault');
    const saveBtn = document.getElementById('save-btn');
    
    // Function to save a message to the vault
    function saveMessage(message) {
        // Check if vault is full for free users
        if (!canSaveToVault()) {
            alert('Your vault is full! Free users can save up to 10 messages. Upgrade to Premium for unlimited storage.');
            return;
        }
        
        // Get current vault from localStorage
        const vault = JSON.parse(localStorage.getItem('messageVault')) || [];
        
        // Create new message object
        const newMessage = {
            id: Date.now(), // Use timestamp as unique ID
            text: message,
            date: new Date().toISOString()
        };
        
        // Add to vault
        vault.push(newMessage);
        
        // Save back to localStorage
        localStorage.setItem('messageVault', JSON.stringify(vault));
        
        // Visual feedback
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved to Vault!';
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
        }, 2000);
        
        // Refresh vault display if the vault section is active
        if (document.getElementById('vault-section').classList.contains('active-section')) {
            refreshVault();
        }
    }
    
    // Function to check if user can save to vault (based on free tier limit)
    function canSaveToVault() {
        const vault = JSON.parse(localStorage.getItem('messageVault')) || [];
        // Free tier limit is 10 saved messages
        return vault.length < 10;
    }
    
    // Function to refresh vault display
    function refreshVault() {
        const vault = JSON.parse(localStorage.getItem('messageVault')) || [];
        
        // Update saved count
        savedCount.textContent = vault.length;
        
        // Clear existing content
        vaultContainer.innerHTML = '';
        
        // Show empty vault message if no saved messages
        if (vault.length === 0) {
            vaultContainer.appendChild(emptyVault);
            emptyVault.classList.remove('hidden');
            return;
        } else {
            emptyVault.classList.add('hidden');
        }
        
        // Add each message to vault container
        vault.forEach(message => {
            const vaultItem = document.createElement('div');
            vaultItem.className = 'vault-item';
            vaultItem.dataset.id = message.id;
            
            const date = new Date(message.date);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            vaultItem.innerHTML = `
                <div class="vault-item-date">${formattedDate}</div>
                <p>${message.text}</p>
                <div class="vault-item-actions">
                    <button class="copy-vault-btn"><i class="fas fa-copy"></i> Copy</button>
                    <button class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            
            vaultContainer.appendChild(vaultItem);
            
            // Copy button functionality
            vaultItem.querySelector('.copy-vault-btn').addEventListener('click', function() {
                navigator.clipboard.writeText(message.text).then(() => {
                    // Visual feedback for copy
                    const copyBtn = this;
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 2000);
                });
            });
            
            // Delete button functionality
            vaultItem.querySelector('.delete-btn').addEventListener('click', function() {
                deleteMessage(message.id);
            });
        });
    }
    
    // Function to delete a message
    function deleteMessage(id) {
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }
        
        // Get current vault
        let vault = JSON.parse(localStorage.getItem('messageVault')) || [];
        
        // Filter out the message to delete
        vault = vault.filter(message => message.id !== id);
        
        // Save back to localStorage
        localStorage.setItem('messageVault', JSON.stringify(vault));
        
        // Refresh vault display
        refreshVault();
    }
    
    // Make saveMessage available to other scripts
    window.saveMessage = saveMessage;
    
    // Make refreshVault available to other scripts
    window.refreshVault = refreshVault;
    
    // Initialize the vault
    refreshVault();
});
