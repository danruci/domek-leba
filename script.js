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

    // Twój rzeczywisty URL webhooka z Make.com
    const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/6zipxc66i7kmuijffna2s09y04uuqndb'; 

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

    // Funkcja wysyłająca wiadomość do Make.com
    async function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        addMessage(userMessage, 'user-message');
        chatInput.value = '';

        const thinkingMessageElement = addMessage('...myślę...', 'bot-thinking'); 

        try {
            const response = await fetch(MAKE_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            // Odczytaj strumień odpowiedzi TYLKO RAZ
            const rawResponseText = await response.text(); 

            if (!response.ok) {
                throw new Error(`Błąd HTTP! Status: ${response.status} - ${response.statusText}. Odpowiedź serwera: ${rawResponseText.substring(0, 100)}`); // Ogranicz do 100 znaków
            }

            // Próba sparsowania JSON z już odczytanego tekstu
            let data;
            try {
                // Bardziej agresywne czyszczenie stringu:
                // 1. trim() usuwa białe znaki z początku/końca
                // 2. replace() usuwa znaki kontrolne (niewidoczne), które mogą zakłócać parser JSON
                // 3. encode/decodeURIComponent to często skuteczny sposób na "resetowanie" kodowania i usuwanie problematycznych znaków
                const cleanedText = decodeURIComponent(encodeURIComponent(rawResponseText.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '')));
                data = JSON.parse(cleanedText); 
            } catch (jsonError) {
                console.error("Błąd parsowania JSON:", jsonError, "Surowa odpowiedź (po czyszczeniu):", rawResponseText);
                throw new Error(`Błąd parsowania odpowiedzi JSON. Odpowiedź: ${rawResponseText.substring(0, 100)}`);
            }
            
            // Sprawdź, czy pole 'reply' istnieje i nie jest puste
            const botReply = data.reply ? String(data.reply) : "Przepraszam, nie otrzymałem konkretnej odpowiedzi od bota. Spróbuj ponownie.";

            updateMessage(thinkingMessageElement, botReply, 'bot-message');

        } catch (error) {
            console.error('Błąd wysyłania wiadomości do Make.com:', error);
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
        //     addMessage('Witaj! Jestem asystentem domku. W czym mogę pomóc?', 'bot-message');
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
    const closeLightboxButton = document.querySelector('#lightbox-modal .close-button'); // Użyj bardziej specyficznego selektora
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    let currentImageIndex; // Przechowuje indeks aktualnie wyświetlanego zdjęcia

    // Funkcja otwierająca modal
    const openLightbox = (imageSrc, index) => {
        lightboxImage.src = imageSrc; // Ustaw źródło pełnowymiarowego zdjęcia
        currentImageIndex = index; // Zapisz indeks
        lightboxModal.removeAttribute('hidden'); // WAŻNE: Usuń atrybut hidden, aby modal był widoczny
        lightboxModal.style.display = 'flex'; // Pokaż modal (użyj flex do centrowania)
        document.body.style.overflow = 'hidden'; // Zablokuj scrollowanie tła
    };

    // Funkcja zamykająca modal
    const closeLightbox = () => {
        lightboxModal.style.display = 'none'; // Ukryj modal
        lightboxModal.setAttribute('hidden', ''); // WAŻNE: Dodaj atrybut hidden z powrotem
        document.body.style.overflow = ''; // Przywróć scrollowanie tła
    };

    // Funkcja do nawigacji po zdjęciach
    const navigateImages = (direction) => {
        // Oblicz nowy indeks
        currentImageIndex += direction;
        // Zawiń indeks, aby przechodzić od ostatniego do pierwszego i odwrotnie
        if (currentImageIndex < 0) {
            currentImageIndex = galleryLinks.length - 1;
        } else if (currentImageIndex >= galleryLinks.length) {
            currentImageIndex = 0;
        }
        // Ustaw nowe źródło obrazu w modalu
        lightboxImage.src = galleryLinks[currentImageIndex].href;
    };

    // Dodaj nasłuchiwanie kliknięć na każdy link w galerii
    galleryLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Zapobiegaj domyślnej akcji linku (przejściu do zdjęcia)
            openLightbox(link.href, index); // Otwórz modal z klikniętym zdjęciem
        });
    });

    // Dodaj nasłuchiwanie kliknięć na przycisk zamykania
    if (closeLightboxButton) { // Sprawdź, czy przycisk istnieje
        closeLightboxButton.addEventListener('click', closeLightbox);
    }

    // Dodaj nasłuchiwanie kliknięć na przyciski nawigacyjne
    if (prevButton) { // Sprawdź, czy przycisk istnieje
        prevButton.addEventListener('click', () => navigateImages(-1)); // Poprzednie zdjęcie
    }
    if (nextButton) { // Sprawdź, czy przycisk istnieje
        nextButton.addEventListener('click', () => navigateImages(1)); // Następne zdjęcie
    }

    // Dodaj nasłuchiwanie kliknięć poza obrazem w modalu (aby zamknąć)
    if (lightboxModal) { // Sprawdź, czy modal istnieje
        lightboxModal.addEventListener('click', (e) => {
            // Jeśli kliknięto bezpośrednio na tło modalu (nie na jego zawartość)
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

    // Dodaj nasłuchiwanie klawiszy (Esc do zamknięcia, strzałki do nawigacji)
    document.addEventListener('keydown', (e) => {
        if (lightboxModal && lightboxModal.style.display === 'flex') { // Tylko jeśli modal jest otwarty
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
