// Veri gönderme işlemini izle
const spinMessageModal = document.querySelector('.spin-message-modal');
const originalDisplay = spinMessageModal.style.display;

// MutationObserver ile modal değişikliklerini izle
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            if (spinMessageModal.style.display === 'block') {
                // Modal gösterildiğinde veriyi gönder
                const messageText = spinMessageModal.querySelector('.spin-message-text').textContent;
                
                fetch('save_data.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: localStorage.getItem('username'),
                        prize: messageText,
                        attempts: remainingAttempts
                    })
                })
                .then(response => response.json())
                .then(data => console.log('Veri kaydedildi'))
                .catch(error => console.error('Hata:', error));
            }
        }
    });
});

// Modalı izlemeye başla
observer.observe(spinMessageModal, {
    attributes: true
});