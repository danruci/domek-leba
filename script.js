document.addEventListener('DOMContentLoaded', () => {
    // === Skrypt dla mobilnego menu ===
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }

    // === Skrypt dla efektu Fade-in przy scrollowaniu ===
    const fadeInSections = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Wyzwól, gdy 10% elementu jest widoczne
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Przestań obserwować po tym, jak element stał się widoczny
            }
        });
    }, observerOptions);

    fadeInSections.forEach(section => {
        observer.observe(section);
    });

    // === Skrypt dla aktualnego roku w stopce ===
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // === Logika dla Pływającego Chatbota ===
    const chatToggleBtn = document.getElementById('chat-toggle-button');
    const floatingChatbotContainer = document.getElementById('floating-chatbot-container');
    const closeChatBtn = document.getElementById('close-chat-button');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    // === UWAGA: Oryginalny URL webhooka został usunięty z kodu w celu bezpieczeństwa.
    // === Zamiast tego, będziemy używać funkcji proxy na Cloudflare Pages pod adresem /api/chat.

    // Funkcja do dodawania wiadomości do czatu
    function addMessage(text, senderClass) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', senderClass);
        messageElement.textContent = text; // Ustawia tekst
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Przewiń do najnowszej wiadomości
        return messageElement; // Zwróć element wiadomości do późniejszej aktualizacji
    }

    // Funkcja aktualizująca istniejącą wiadomość
    function updateMessage(messageElement, newText, newSenderClass) {
        if (messageElement) {
            messageElement.textContent = newText;
            // Usuń wszystkie poprzednie klasy typu wiadomości i dodaj nową
            messageElement.classList.remove('user-message', 'bot-thinking', 'bot-message', 'error-message');
            messageElement.classList.add(newSenderClass);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Przewiń po aktualizacji
        }
    }

    // Funkcja wysyłająca wiadomość do Cloudflare Pages Function
    async function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        addMessage(userMessage, 'user-message');
        chatInput.value = '';

        const thinkingMessageElement = addMessage('...myślę...', 'bot-thinking');

        try {
            // Zmienione wywołanie fetch, aby używać lokalnego endpointa proxy
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const rawResponseText = await response.text();

            if (!response.ok) {
                throw new Error(`Błąd HTTP! Status: ${response.status} - ${response.statusText}. Odpowiedź serwera: ${rawResponseText.substring(0, 100)}`);
            }

            let data;
            try {
                const cleanedText = decodeURIComponent(encodeURIComponent(rawResponseText.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '')));
                data = JSON.parse(cleanedText);
            } catch (jsonError) {
                console.error("Błąd parsowania JSON:", jsonError, "Surowa odpowiedź (po czyszczeniu):", rawResponseText);
                throw new Error(`Błąd parsowania odpowiedzi JSON. Odpowiedź: ${rawResponseText.substring(0, 100)}`);
            }

            const botReply = data.reply ? String(data.reply) : "Przepraszam, nie otrzymałem konkretnej odpowiedzi od bota. Spróbuj ponownie.";

            updateMessage(thinkingMessageElement, botReply, 'bot-message');

        } catch (error) {
            console.error('Błąd wysyłania wiadomości do proxy:', error);
            updateMessage(thinkingMessageElement, `Przepraszam, wystąpił problem z komunikacją: ${error.message || 'Nieznany błąd'}. Spróbuj ponownie.`, 'error-message');
        } finally {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Obsługa otwierania/zamykania chatbota
    if (chatToggleBtn && floatingChatbotContainer && closeChatBtn) {
        chatToggleBtn.addEventListener('click', () => {
            floatingChatbotContainer.classList.toggle('active');
            if (floatingChatbotContainer.classList.contains('active')) {
                chatInput.focus();
            }
        });

        closeChatBtn.addEventListener('click', () => {
            floatingChatbotContainer.classList.remove('active');
        });
    }

    // Obsługa wysyłania wiadomości po kliknięciu lub naciśnięciu Enter
    if (sendButton && chatInput) {
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Wiadomość powitalna przy ładowaniu strony
    if (chatMessages) {
        // Możesz dodać opóźnienie, jeśli chcesz, aby wiadomość pojawiła się z opóźnieniem
        // setTimeout(() => {
        //      addMessage('Witaj! Jestem asystentem domku. W czym mogę pomóc?', 'bot-message');
        // }, 500);
        // addMessage('Witaj! Jestem asystentem domku. W czym mogę pomóc?', 'bot-message');
    }

    // ====================================
    // NOWA LOGIKA DLA GALERII (LIGHTBOX)
    // ====================================

    // Pobierz wszystkie linki do zdjęć w galerii
    const galleryLinks = document.querySelectorAll('.gallery-grid a');
    // Pobierz elementy modalu
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const closeLightboxButton = document.querySelector('#lightbox-modal .close-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    let currentImageIndex; // Przechowuje indeks aktualnie wyświetlanego zdjęcia

    // Funkcja otwierająca modal
    const openLightbox = (imageSrc, index) => {
        lightboxImage.src = imageSrc;
        currentImageIndex = index;
        lightboxModal.removeAttribute('hidden');
        lightboxModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    // Funkcja zamykająca modal
    const closeLightbox = () => {
        lightboxModal.style.display = 'none';
        lightboxModal.setAttribute('hidden', '');
        document.body.style.overflow = '';
    };

    // Funkcja do nawigacji po zdjęciach
    const navigateImages = (direction) => {
        currentImageIndex += direction;
        if (currentImageIndex < 0) {
            currentImageIndex = galleryLinks.length - 1;
        } else if (currentImageIndex >= galleryLinks.length) {
            currentImageIndex = 0;
        }
        lightboxImage.src = galleryLinks[currentImageIndex].href;
    };

    // Dodaj nasłuchiwanie kliknięć na każdy link w galerii
    galleryLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(link.href, index);
        });
    });

    // Dodaj nasłuchiwanie kliknięć na przycisk zamykania
    if (closeLightboxButton) {
        closeLightboxButton.addEventListener('click', closeLightbox);
    }

    // Dodaj nasłuchiwanie kliknięć na przyciski nawigacyjne
    if (prevButton) {
        prevButton.addEventListener('click', () => navigateImages(-1));
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => navigateImages(1));
    }

    // Dodaj nasłuchiwanie kliknięć poza obrazem w modalu (aby zamknąć)
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

    // Dodaj nasłuchiwanie klawiszy (Esc do zamknięcia, strzałki do nawigacji)
    document.addEventListener('keydown', (e) => {
        if (lightboxModal && lightboxModal.style.display === 'flex') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                navigateImages(-1);
            } else if (e.key === 'ArrowRight') {
                navigateImages(1);
            }
        }
    });
});
