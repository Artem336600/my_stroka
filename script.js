document.addEventListener('DOMContentLoaded', function() {
    // Инициализация сервиса авторизации Telegram
    const telegramAuthService = new TelegramAuthService();
    telegramAuthService.initialize();
    
    // Текущий запрос на авторизацию
    let currentAuthRequest = null;
    
    // Максимальное количество отображаемых результатов
    let maxVisibleResults = 6;
    
    // Максимальное количество отображаемых результатов
    const maxDisplayResults = 6;
    
    // Переменная для числа результатов при совпадении тегов
    let maxDisplayResultsForTagMatch = maxDisplayResults;
    
    // Демо-данные пользователей (в реальном приложении это пришло бы с сервера)
    const users = [
        {
            id: 1,
            name: 'Александр Петров',
            location: 'Москва, Россия',
            interests: ['Фотография', 'Путешествия', 'Дизайн', 'Архитектура', 'Блоггинг'],
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            premium: true,
            bio: 'Фотограф и путешественник. Посетил более 20 стран. Люблю архитектуру и современный дизайн.',
            background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)'
        },
        {
            id: 2,
            name: 'Елена Иванова',
            location: 'Санкт-Петербург, Россия',
            interests: ['Музыка', 'Программирование', 'Книги', 'Саморазвитие', 'Психология'],
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            premium: false,
            bio: 'Программист и музыкант. Играю на гитаре и фортепиано. Увлекаюсь психологией и саморазвитием.',
            background: 'linear-gradient(135deg, #FF7AF5 0%, #513162 100%)'
        },
        {
            id: 3,
            name: 'Дмитрий Соколов',
            location: 'Казань, Россия',
            interests: ['Спорт', 'Технологии', 'Кулинария', 'Футбол', 'Бег'],
            avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
            premium: false,
            bio: 'Люблю активный образ жизни. Бегаю по утрам, играю в футбол по выходным. Увлекаюсь новыми технологиями.',
            background: 'linear-gradient(135deg, #43CBFF 0%, #3D5BFF 100%)'
        },
        {
            id: 4,
            name: 'Анна Морозова',
            location: 'Екатеринбург, Россия',
            interests: ['Искусство', 'Йога', 'Фотография', 'Медитация', 'Живопись'],
            avatar: 'https://randomuser.me/api/portraits/women/58.jpg',
            premium: true,
            bio: 'Художник и инструктор йоги. Практикую медитацию более 5 лет. Люблю рисовать пейзажи и портреты.',
            background: 'linear-gradient(135deg, #FF9D6C 0%, #BB4E75 100%)'
        },
        {
            id: 5,
            name: 'Максим Волков',
            location: 'Новосибирск, Россия',
            interests: ['Путешествия', 'Блоггинг', 'Программирование', 'Фотография', 'Видеомонтаж'],
            avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
            premium: false,
            bio: 'Travel-блогер и веб-разработчик. Путешествую и работаю удаленно. Снимаю видео о своих поездках.',
            background: 'linear-gradient(135deg, #3CA55C 0%, #B5AC49 100%)'
        },
        {
            id: 6,
            name: 'Ольга Смирнова',
            location: 'Краснодар, Россия',
            interests: ['Музыка', 'Кулинария', 'Психология', 'Садоводство', 'Вокал'],
            avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
            premium: false,
            bio: 'Повар и психолог. Люблю петь и выращивать растения. Веду кулинарный блог.',
            background: 'linear-gradient(135deg, #5D26C1 0%, #a17fe0 100%)'
        }
    ];

    // Элементы DOM
    const searchInput = document.getElementById('search-input');
    const searchSuggestions = document.getElementById('search-suggestions');
    const searchButton = document.querySelector('.search-button');
    const resultsContainer = document.getElementById('results-container');
    const loadMoreButton = document.getElementById('load-more');
    const filterButton = document.querySelector('.filter-btn');
    const filterModal = document.getElementById('filterModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const noResultsMessage = document.getElementById('no-results-message');
    
    // Регистрация через Telegram
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    const ctaRegisterBtn = document.getElementById('ctaRegisterBtn');
    const registerModal = document.getElementById('registerModal');
    const successModal = document.getElementById('successModal');
    const telegramAuthForm = document.getElementById('telegramAuthForm');
    const phoneInput = document.getElementById('phoneNumber');
    const sendAuthRequestBtn = document.getElementById('sendAuthRequestBtn');
    const confirmationBlock = document.getElementById('confirmationBlock');
    const cancelAuthBtn = document.getElementById('cancelAuth');
    const continueBtn = document.getElementById('continueBtn');
    
    // Пользовательские данные (имитация авторизации)
    let currentUser = null;
    
    // Проверяем, был ли пользователь авторизован ранее
    checkPreviousAuth();
    
    // Настройка обработчиков событий для авторизации Telegram
    if (telegramAuthForm) {
        telegramAuthForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const phoneNumber = phoneInput.value.trim();
            
            if (!telegramAuthService.validatePhoneNumber(phoneNumber)) {
                showError('Пожалуйста, введите корректный номер телефона в формате +7XXXXXXXXXX');
                return;
            }
            
            // Показываем индикатор загрузки
            sendAuthRequestBtn.disabled = true;
            sendAuthRequestBtn.innerHTML = '<span class="loading-indicator"></span> Отправка запроса...';
            
            // Создаем запрос на авторизацию
            telegramAuthService.createAuthRequest(phoneNumber)
                .then(requestId => {
                    // Сохраняем текущий запрос на авторизацию
                    currentAuthRequest = requestId;
                    
                    // Отображаем блок подтверждения
                    confirmationBlock.style.display = 'block';
                    sendAuthRequestBtn.textContent = 'Ожидание подтверждения...';
                    
                    // Обработчики событий для кнопок в блоке подтверждения
                    if (cancelAuthBtn) {
                        cancelAuthBtn.addEventListener('click', function() {
                            // Отменяем запрос авторизации
                            telegramAuthService.rejectAuthRequest(currentAuthRequest);
                            resetAuthForm();
                            // Скрываем блок подтверждения
                            confirmationBlock.style.display = 'none';
                            // Сбрасываем состояние кнопки
                            sendAuthRequestBtn.disabled = false;
                            sendAuthRequestBtn.textContent = 'Отправить запрос';
                        });
                    }
                    
                    // Устанавливаем обработчики для подтверждения и отклонения
                    telegramAuthService.setAuthRequestCallbacks(
                        requestId,
                        function(userData) {
                            // Обработка успешной авторизации
                            handleTelegramAuthSuccess(userData);
                        },
                        function() {
                            // Обработка отклоненной авторизации
                            showError('Запрос на авторизацию был отклонен');
                            resetAuthForm();
                        }
                    );
                    
                    // Проверка статуса авторизации каждые 3 секунды
                    const statusCheckInterval = setInterval(() => {
                        telegramAuthService.checkAuthRequestStatus(requestId)
                            .then(status => {
                                if (status.status === 'confirmed') {
                                    clearInterval(statusCheckInterval);
                                } else if (status.status === 'rejected') {
                                    clearInterval(statusCheckInterval);
                                    showError('Запрос на авторизацию был отклонен');
                                    resetAuthForm();
                                }
                            })
                            .catch(error => {
                                clearInterval(statusCheckInterval);
                                showError('Произошла ошибка при проверке статуса: ' + error.message);
                                resetAuthForm();
                            });
                    }, 3000);
                    
                    // Демо-режим: имитируем успешную авторизацию через 3 секунды
                    setTimeout(() => {
                        // Генерируем демо-данные пользователя
                        const demoUser = {
                            id: telegramAuthService.generateUserId(),
                            phoneNumber: phoneNumber,
                            firstName: 'Тестовый',
                            lastName: 'Пользователь',
                            username: 'demo_user',
                            photoUrl: 'https://randomuser.me/api/portraits/men/85.jpg',
                            authDate: Math.floor(Date.now() / 1000)
                        };
                        
                        // Вызываем обработчик успешной авторизации
                        handleTelegramAuthSuccess(demoUser);
                        
                        // Очищаем интервал проверки статуса
                        clearInterval(statusCheckInterval);
                    }, 3000);
                })
                .catch(error => {
                    showError('Произошла ошибка при создании запроса: ' + error.message);
                    resetAuthForm();
                });
        });
    }
    
    // Если есть кнопки регистрации/входа, настраиваем обработчики
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            registerModal.style.display = 'flex';
        });
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            registerModal.style.display = 'flex';
        });
    }
    
    if (ctaRegisterBtn) {
        ctaRegisterBtn.addEventListener('click', function() {
            registerModal.style.display = 'flex';
        });
    }
    
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            successModal.style.display = 'none';
            // Обновляем UI в соответствии с авторизованным пользователем
            updateUIForLoggedInUser();
        });
    }
    
    // Заполняем начальные результаты
    displayResults(users);
    
    // Обработчики поиска и фильтрации
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', loadMoreResults);
    }
    
    // Модальные окна
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModalHandler);
    });
    
    // Закрытие модальных окон при клике вне содержимого
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            
            // Если модальное окно регистрации закрыто, сбрасываем форму
            if (e.target.id === 'registerModal') {
                resetAuthForm();
            }
        }
    });
    
    // Открытие модального окна фильтров
    if (filterButton) {
        filterButton.addEventListener('click', function() {
            filterModal.style.display = 'flex';
        });
    }
    
    // Применение фильтров
    if (filterModal) {
        const applyFilterButton = filterModal.querySelector('.modal-footer .btn-filled');
        if (applyFilterButton) {
            applyFilterButton.addEventListener('click', function() {
                performSearch();
                filterModal.style.display = 'none';
            });
        }
        
        const resetFilterButton = filterModal.querySelector('.modal-footer .btn-outline');
        if (resetFilterButton) {
            resetFilterButton.addEventListener('click', resetFilters);
        }
    }
    
    // Настройка обработчиков для модальных окон сообщений и уведомлений
    const messagesLink = document.querySelector('a[href="#messages"]');
    const notificationsLink = document.querySelector('a[href="#notifications"]');
    const messagesModal = document.getElementById('messagesModal');
    const notificationsModal = document.getElementById('notificationsModal');
    
    // Обработчики для открытия модальных окон
    if (messagesLink) {
        messagesLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (messagesModal) {
                messagesModal.style.display = 'flex';
            }
        });
    }
    
    if (notificationsLink) {
        notificationsLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (notificationsModal) {
                notificationsModal.style.display = 'flex';
            }
        });
    }
    
    // Обработчики для кнопок в модальном окне сообщений
    if (messagesModal) {
        const markAllReadBtn = messagesModal.querySelector('#markAllReadBtn');
        const openMessengerBtn = messagesModal.querySelector('#openMessengerBtn');
        
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', function() {
                const unreadMessages = messagesModal.querySelectorAll('.message-item.unread');
                unreadMessages.forEach(message => {
                    message.classList.remove('unread');
                });
                
                // Обновляем счетчик непрочитанных сообщений
                updateMessageCounter(0);
            });
        }
        
        if (openMessengerBtn) {
            openMessengerBtn.addEventListener('click', function() {
                alert('Мессенджер будет доступен в ближайшем обновлении!');
            });
        }
    }
    
    // Обработчики для кнопок в модальном окне уведомлений
    if (notificationsModal) {
        const clearNotificationsBtn = notificationsModal.querySelector('#clearNotificationsBtn');
        const markAllNotifReadBtn = notificationsModal.querySelector('#markAllNotifReadBtn');
        
        if (clearNotificationsBtn) {
            clearNotificationsBtn.addEventListener('click', function() {
                const notificationsList = notificationsModal.querySelector('.notifications-list');
                if (notificationsList) {
                    notificationsList.innerHTML = `
                        <div class="empty-notifications">
                            <i class="fa-solid fa-bell-slash empty-icon"></i>
                            <p>У вас нет новых уведомлений</p>
                        </div>
                    `;
                }
                
                // Обновляем счетчик уведомлений
                updateNotificationCounter(0);
            });
        }
        
        if (markAllNotifReadBtn) {
            markAllNotifReadBtn.addEventListener('click', function() {
                const unreadNotifications = notificationsModal.querySelectorAll('.notification-item.unread');
                unreadNotifications.forEach(notification => {
                    notification.classList.remove('unread');
                });
                
                // Обновляем счетчик непрочитанных уведомлений
                updateNotificationCounter(0);
            });
        }
        
        // Добавляем обработчики для кнопок действий в уведомлениях
        const notificationActionButtons = notificationsModal.querySelectorAll('.notification-actions button');
        notificationActionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const notificationItem = this.closest('.notification-item');
                if (notificationItem) {
                    // Обрабатываем действие и удаляем уведомление
                    setTimeout(() => {
                        notificationItem.style.height = '0';
                        notificationItem.style.padding = '0';
                        notificationItem.style.overflow = 'hidden';
                        notificationItem.style.borderBottom = 'none';
                        
                        setTimeout(() => {
                            notificationItem.remove();
                            
                            // Обновляем счетчик уведомлений
                            const remainingUnread = notificationsModal.querySelectorAll('.notification-item.unread').length;
                            updateNotificationCounter(remainingUnread);
                        }, 300);
                    }, 100);
                }
            });
        });
    }
    
    // Функция обновления счетчика непрочитанных сообщений
    function updateMessageCounter(count) {
        const messageBadge = document.querySelector('a[href="#messages"] .notification-badge');
        if (messageBadge) {
            if (count > 0) {
                messageBadge.textContent = count;
                messageBadge.style.display = 'flex';
            } else {
                messageBadge.style.display = 'none';
            }
        }
    }
    
    // Функция обновления счетчика уведомлений
    function updateNotificationCounter(count) {
        const notificationBadge = document.querySelector('a[href="#notifications"] .notification-badge');
        if (notificationBadge) {
            if (count > 0) {
                notificationBadge.textContent = count;
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        }
    }
    
    /**
     * Функции для работы с авторизацией
     */
    
    // Проверка предыдущей авторизации
    function checkPreviousAuth() {
        const savedUser = localStorage.getItem('telegramUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                updateUIForLoggedInUser();
            } catch (e) {
                localStorage.removeItem('telegramUser');
            }
        }
    }
    
    // Обработка успешной авторизации через Telegram
    function handleTelegramAuthSuccess(userData) {
        // Сохраняем данные пользователя
        currentUser = userData;
        localStorage.setItem('telegramUser', JSON.stringify(userData));
        
        // Скрываем модальное окно регистрации
        registerModal.style.display = 'none';
        
        // Показываем модальное окно успешной регистрации
        const userNameElement = document.getElementById('successUserName');
        if (userNameElement) {
            userNameElement.textContent = userData.firstName || 'Пользователь';
        }
        
        successModal.style.display = 'flex';
        
        // Удаляем текущий запрос на авторизацию
        if (currentAuthRequest) {
            telegramAuthService.removeAuthRequest(currentAuthRequest);
            currentAuthRequest = null;
        }
        
        // Сбрасываем форму авторизации
        resetAuthForm();
    }
    
    // Обновление интерфейса для авторизованного пользователя
    function updateUIForLoggedInUser() {
        if (!currentUser) return;
        
        // Обновляем элемент пользовательского меню в хедере
        const authButtonsContainer = document.querySelector('.auth-buttons');
        if (authButtonsContainer) {
            // Скрываем кнопки регистрации и входа
            authButtonsContainer.style.display = 'none';
            
            // Создаем элемент пользовательского меню, если его нет
            let userMenuElement = document.querySelector('.user-menu');
            if (!userMenuElement) {
                userMenuElement = document.createElement('div');
                userMenuElement.className = 'user-menu';
                authButtonsContainer.parentNode.appendChild(userMenuElement);
            }
            
            // Создаем или обновляем HTML для авторизованного пользователя
            const userAvatarSrc = currentUser.photoUrl || 'https://randomuser.me/api/portraits/lego/1.jpg';
            const userName = currentUser.firstName || 'Пользователь';
            
            userMenuElement.innerHTML = `
                <div class="user-profile">
                    <img src="${userAvatarSrc}" alt="${userName}" class="user-avatar">
                    <span class="user-name">${userName}</span>
                </div>
                <div class="user-controls">
                    <a href="#messages" class="user-control-item">
                        <i class="fa-solid fa-message"></i>
                        <span class="notification-badge">3</span>
                    </a>
                    <a href="#notifications" class="user-control-item">
                        <i class="fa-solid fa-bell"></i>
                        <span class="notification-badge">7</span>
                    </a>
                    <div class="user-control-item user-menu-dropdown">
                        <i class="fa-solid fa-gear"></i>
                        <div class="dropdown-content">
                            <a href="#profile">Мой профиль</a>
                            <a href="#settings">Настройки</a>
                            <a href="#" id="logoutBtn">Выйти</a>
                        </div>
                    </div>
                </div>
            `;
            
            // Добавляем обработчик для кнопки выхода
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
        }
    }
    
    // Выход из аккаунта
    function logout() {
        localStorage.removeItem('telegramUser');
        currentUser = null;
        
        // Восстанавливаем кнопки регистрации и входа
        const authButtonsContainer = document.querySelector('.auth-buttons');
        if (authButtonsContainer) {
            authButtonsContainer.style.display = 'flex';
        }
        
        // Удаляем пользовательское меню
        const userMenuElement = document.querySelector('.user-menu');
        if (userMenuElement) {
            userMenuElement.remove();
        }
        
        alert('Вы успешно вышли из аккаунта');
    }
    
    // Функция сброса формы авторизации
    function resetAuthForm() {
        if (telegramAuthForm) {
            telegramAuthForm.reset();
        }
        if (sendAuthRequestBtn) {
            sendAuthRequestBtn.disabled = false;
            sendAuthRequestBtn.textContent = 'Отправить запрос';
        }
        if (confirmationBlock) {
            confirmationBlock.style.display = 'none';
        }
        currentAuthRequest = null;
    }
    
    // Показ сообщения об ошибке
    function showError(message) {
        const errorElement = document.getElementById('authError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Скрываем сообщение через 5 секунд
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }
    
    function closeModalHandler() {
        const modal = this.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
            
            // Если модальное окно регистрации закрыто, сбрасываем форму
            if (modal.id === 'registerModal') {
                resetAuthForm();
            }
        }
    }
    
    /**
     * Функции поиска и отображения результатов
     */
    
    // Обработка ввода в поле поиска
    function handleSearchInput() {
        const query = searchInput.value.trim().toLowerCase();
        
        // Отключаем функциональность подсказок
        searchSuggestions.innerHTML = '';
        searchSuggestions.style.display = 'none';
    }
    
    // Выполнение поиска
    function performSearch() {
        const query = searchInput.value.trim();
        
        if (query.length === 0) {
            displayResults(users);
            return;
        }
        
        // Показываем индикатор загрузки
        resultsContainer.innerHTML = `
            <div class="loading-container">
                <div class="brain-loading">
                    <div class="brain-container">
                        <svg class="brain" viewBox="0 0 500 500">
                            <path class="brain-path left-hemi" d="M250,25C125,25,25,150,25,250S150,475,250,475" />
                            <path class="brain-path right-hemi" d="M250,25C375,25,475,150,475,250S350,475,250,475" />
                            <path class="brain-path connection" d="M250,25 Q250,250,250,475" />
                            <circle class="pulse-circle" cx="250" cy="250" r="5" />
                        </svg>
                    </div>
                    <div class="loading-text">
                        <p>Анализируем ваш запрос с помощью ИИ</p>
                        <div class="dots">
                            <span class="dot">.</span>
                            <span class="dot">.</span>
                            <span class="dot">.</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Удаляем предыдущий блок популярных тегов в hero секции, если он есть
        const existingHeroTags = document.querySelector('.hero .popular-tags');
        if (existingHeroTags) {
            existingHeroTags.remove();
        }

        // Отправляем запрос к API для извлечения тегов
        fetch('http://localhost:5000/extract_tags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка API');
            }
            return response.json();
        })
        .then(data => {
            const extractedTags = data.tags || [];
            console.log('Извлеченные теги:', extractedTags);
            
            // Добавляем найденные теги в hero секцию
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                // Создаем блок для тегов в hero секции
                const heroTagsContainer = document.createElement('div');
                heroTagsContainer.className = 'popular-tags improved-tags';
                
                // Добавляем заголовок и теги
                let heroTagsHTML = '<div class="tags-header"><span class="tag-label">Найденные теги:</span>';
                
                // Добавляем кнопку добавления нового тега
                heroTagsHTML += `<button class="add-tag-btn" title="Добавить тег" style="display: flex; align-items: center; justify-content: center; font-size: 16px; background-color: var(--primary-color); color: white; border-radius: 50%; width: 30px; height: 30px; border: none; box-shadow: 0 2px 5px rgba(0,0,0,0.2); cursor: pointer;"><i class="fa-solid fa-plus"></i></button></div>`;
                
                // Добавляем контейнер для тегов
                heroTagsHTML += '<div class="tags-wrapper">';
                
                // Добавляем найденные теги
                extractedTags.forEach(tag => {
                    heroTagsHTML += `
                    <div class="tag-container">
                        <a href="#" class="tag">${tag}</a>
                        <button class="remove-tag-btn" title="Удалить тег"><i class="fa-solid fa-times"></i></button>
                    </div>`;
                });
                
                // Закрываем контейнер для тегов
                heroTagsHTML += '</div>';
                
                // Создаем форму для добавления нового тега
                heroTagsHTML += `
                <div class="add-tag-form" style="display: none;">
                    <div class="tag-selector">
                        <div class="tag-selector-header">
                            <h4>Выберите тег для добавления:</h4>
                        </div>
                        <div class="tag-categories">
                            <div class="tag-category active" data-category="all">Все теги</div>
                            <div class="tag-category" data-category="art">Искусство</div>
                            <div class="tag-category" data-category="tech">Технологии</div>
                            <div class="tag-category" data-category="sport">Спорт</div>
                            <div class="tag-category" data-category="hobby">Хобби</div>
                        </div>
                        <div class="tags-list">
                            <!-- Теги будут добавлены динамически -->
                        </div>
                    </div>
                    <div class="tag-selector-footer">
                        <button class="btn btn-small btn-outline cancel-add-tag">Отмена</button>
                    </div>
                </div>`;
                
                heroTagsContainer.innerHTML = heroTagsHTML;
                
                // Добавляем в DOM
                heroContent.appendChild(heroTagsContainer);
                
                // Добавляем обработчики для тегов
                heroTagsContainer.querySelectorAll('.tag').forEach(tagElement => {
                    tagElement.addEventListener('click', function(e) {
                        e.preventDefault();
                        searchInput.value = this.textContent;
                        performSearch();
                    });
                });
                
                // Добавляем обработчик для кнопки добавления тега
                const addTagBtn = heroTagsContainer.querySelector('.add-tag-btn');
                const addTagForm = heroTagsContainer.querySelector('.add-tag-form');
                
                if (addTagBtn && addTagForm) {
                    // Делаем кнопку добавления тега более заметной при наведении
                    addTagBtn.addEventListener('mouseover', function() {
                        this.style.transform = 'scale(1.1)';
                        this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                    });
                    
                    addTagBtn.addEventListener('mouseout', function() {
                        this.style.transform = 'scale(1)';
                        this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                    });
                    
                    addTagBtn.addEventListener('click', function() {
                        // Показываем форму выбора тега
                        addTagForm.style.display = 'block';
                        
                        // Получаем список тегов и контейнер для их отображения
                        const tagsList = addTagForm.querySelector('.tags-list');
                        if (!tagsList) return;
                        
                        // Очищаем список тегов
                        tagsList.innerHTML = '';
                        
                        // Получаем текущие активные теги
                        const currentTags = getActiveTags();
                        
                        // Заполняем список всеми доступными тегами
                        populateTagsList(tagsList, 'all', currentTags);
                        
                        // Добавляем обработчики для категорий тегов
                        const categories = addTagForm.querySelectorAll('.tag-category');
                        categories.forEach(category => {
                            category.addEventListener('click', function() {
                                // Удаляем класс active у всех категорий
                                categories.forEach(c => c.classList.remove('active'));
                                // Добавляем класс active текущей категории
                                this.classList.add('active');
                                // Обновляем список тегов
                                populateTagsList(tagsList, this.dataset.category, currentTags);
                            });
                        });
                    });
                    
                    // Обработчик для кнопки отмены добавления тега
                    const cancelAddTagBtn = addTagForm.querySelector('.cancel-add-tag');
                    if (cancelAddTagBtn) {
                        cancelAddTagBtn.addEventListener('click', function() {
                            addTagForm.style.display = 'none';
                            addTagForm.querySelector('.tag-input').value = '';
                        });
                    }
                    
                    // Обработчик для кнопки подтверждения добавления тега
                    const confirmAddTagBtn = addTagForm.querySelector('.confirm-add-tag');
                    if (confirmAddTagBtn) {
                        confirmAddTagBtn.addEventListener('click', function() {
                            const tagInput = addTagForm.querySelector('.tag-input');
                            if (tagInput && tagInput.value.trim()) {
                                const newTag = tagInput.value.trim();
                                
                                // Создаем новый элемент тега
                                const tagsWrapper = heroTagsContainer.querySelector('.tags-wrapper');
                                if (tagsWrapper) {
                                    const newTagContainer = document.createElement('div');
                                    newTagContainer.className = 'tag-container';
                                    newTagContainer.innerHTML = `
                                        <a href="#" class="tag">${newTag}</a>
                                        <button class="remove-tag-btn" title="Удалить тег"><i class="fa-solid fa-times"></i></button>
                                    `;
                                    
                                    // Добавляем обработчик на клик по тегу
                                    const tagLink = newTagContainer.querySelector('.tag');
                                    tagLink.addEventListener('click', function(e) {
                                        e.preventDefault();
                                        searchInput.value = this.textContent;
                                        performSearch();
                                    });
                                    
                                    // Добавляем обработчик на кнопку удаления
                                    const removeBtn = newTagContainer.querySelector('.remove-tag-btn');
                                    removeBtn.addEventListener('click', function() {
                                        newTagContainer.remove();
                                        // Перезапускаем поиск с обновленными тегами
                                        filterResultsByActiveTags(query, getActiveTags());
                                    });
                                    
                                    // Добавляем тег в DOM
                                    tagsWrapper.appendChild(newTagContainer);
                                    
                                    // Перезапускаем поиск с обновленными тегами
                                    filterResultsByActiveTags(query, getActiveTags());
                                }
                                
                                // Сбрасываем форму
                                tagInput.value = '';
                                addTagForm.style.display = 'none';
                            }
                        });
                    }
                }
                
                // Добавляем обработчики для кнопок удаления тегов
                heroTagsContainer.querySelectorAll('.remove-tag-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        // Удаляем контейнер тега
                        const tagContainer = this.closest('.tag-container');
                        if (tagContainer) {
                            tagContainer.remove();
                            // Перезапускаем поиск с обновленными тегами
                            filterResultsByActiveTags(query, getActiveTags());
                        }
                    });
                });
            }
            
            // Фильтруем результаты с задержкой для эффекта
            setTimeout(() => {
                // Скрываем индикатор загрузки
                const loadingContainer = document.querySelector('.loading-container');
                if (loadingContainer) {
                    loadingContainer.style.display = 'none';
                }
                
                // Фильтруем и отображаем результаты по активным тегам
                filterResultsByActiveTags(query, extractedTags);
            }, 1000);
        })
        .catch(error => {
            console.error('Ошибка при извлечении тегов:', error);
            
            // В случае ошибки используем локальное извлечение тегов
            const extractedTags = localExtractTags(query);
            console.log('Извлеченные локально теги:', extractedTags);
            
            // Скрываем индикатор загрузки
            const loadingContainer = document.querySelector('.loading-container');
            if (loadingContainer) {
                loadingContainer.style.display = 'none';
            }
            
            // Увеличиваем лимит отображаемых результатов
            if (extractedTags && extractedTags.length > 0) {
                maxDisplayResultsForTagMatch = 12;
            }
            
            // Фильтруем результаты
            const filteredUsers = users.filter(user => {
                // Если есть теги, фильтруем по ним
                if (extractedTags && extractedTags.length > 0) {
                    return user.interests && user.interests.some(interest => 
                        extractedTags.some(tag => 
                            interest.toLowerCase().includes(tag.toLowerCase()) || 
                            tag.toLowerCase().includes(interest.toLowerCase())
                        )
                    );
                }
                // Иначе фильтруем по запросу
                return (
                    (user.name && user.name.toLowerCase().includes(query.toLowerCase())) || 
                    (user.location && user.location.toLowerCase().includes(query.toLowerCase())) ||
                    (user.interests && user.interests.some(interest => interest.toLowerCase().includes(query.toLowerCase())))
                );
            });
            
            // Выводим результаты
            displayResults(filteredUsers, extractedTags);
        });
    }
    
    // Функция для получения активных тегов из интерфейса
    function getActiveTags() {
        // Находим контейнер с тегами
        const tagContainer = document.querySelector('.hero .popular-tags');
        if (!tagContainer) {
            console.log('Контейнер тегов не найден');
            return [];
        }
        
        // Находим все теги
        const tagElements = tagContainer.querySelectorAll('.tag');
        if (!tagElements || tagElements.length === 0) {
            console.log('Активные теги не найдены');
            return [];
        }
        
        // Преобразуем в массив и получаем текст каждого тега
        return Array.from(tagElements).map(tag => tag.textContent);
    }
    
    // Функция для фильтрации результатов на основе активных тегов
    function filterResultsByActiveTags(query, allTags) {
        // Проверяем, что переданы все необходимые параметры
        if (query === undefined) {
            query = '';
            console.warn('Не передан параметр query в функцию filterResultsByActiveTags');
        }
        
        if (!allTags) {
            allTags = [];
            console.warn('Не передан параметр allTags в функцию filterResultsByActiveTags');
        }
        
        // Проверяем, что массив пользователей определен
        if (!users || !Array.isArray(users)) {
            console.error('Массив пользователей не определен или не является массивом');
            return;
        }
        
        // Получаем активные теги из интерфейса
        const activeTags = getActiveTags();
        
        console.log('Фильтруем по тегам:', activeTags);
        console.log('Все доступные теги:', allTags);
        
        // Инициализируем отфильтрованных пользователей
        let filteredUsers = [];
        
        // Приоритет фильтрации:
        // 1. Активные теги (выбранные пользователем)
        // 2. Извлеченные теги (определенные системой)
        // 3. Поисковый запрос
        
        const tagsToUse = activeTags.length > 0 ? activeTags : allTags;
        
        if (tagsToUse && tagsToUse.length > 0) {
            // Фильтруем пользователей по тегам
            filteredUsers = users.filter(user => 
                tagsToUse.some(tag => 
                    user.interests && user.interests.some(interest => 
                        interest.toLowerCase().includes(tag.toLowerCase()) ||
                        tag.toLowerCase().includes(interest.toLowerCase())
                    )
                )
            );
        } else {
            // Если нет ни активных, ни извлечённых тегов, используем стандартный поиск по запросу
            filteredUsers = users.filter(user => 
                (user.name && user.name.toLowerCase().includes(query.toLowerCase())) || 
                (user.location && user.location.toLowerCase().includes(query.toLowerCase())) ||
                (user.interests && user.interests.some(interest => interest.toLowerCase().includes(query.toLowerCase()))) ||
                (user.bio && user.bio.toLowerCase().includes(query.toLowerCase()))
            );
        }
        
        // Отображаем результаты с выделенными тегами
        const highlightTags = activeTags.length > 0 ? activeTags : allTags || [];
        
        // Если есть результаты и они содержат хотя бы один тег, обновляем maxDisplayResults
        if (filteredUsers.length > 0 && tagsToUse.length > 0) {
            // Показываем большее количество результатов при соответствии тегам
            maxDisplayResultsForTagMatch = 12; // Показываем больше результатов при совпадении тегов
        } else {
            // Возвращаем стандартное значение
            maxDisplayResultsForTagMatch = maxDisplayResults;
        }
        
        // Отображаем отфильтрованных пользователей
        displayResults(filteredUsers, highlightTags);
    }
    
    // Локальное извлечение тегов (резервный вариант)
    function localExtractTags(query) {
        console.log('Используем локальное извлечение тегов');
        const allPossibleTags = [
            // Искусство и творчество
            'Фотография', 'Живопись', 'Графический дизайн', 'Скульптура', 'Каллиграфия', 'Рисование', 
            'Керамика', 'Рукоделие', 'Квиллинг', 'Оригами', 'Вязание', 'Вышивание', 'Анимация',
            'Искусство', 'Иллюстрация', 'Видеомонтаж', 'Кино', 'Театр', 'Цифровое искусство',
            
            // Музыка
            'Музыка', 'Гитара', 'Фортепиано', 'Барабаны', 'Скрипка', 'Пение', 'Вокал', 'Композиция',
            'DJ', 'Продюсирование', 'Саксофон', 'Аккордеон', 'Виолончель', 'Электронная музыка',
            
            // Технологии
            'Программирование', 'Искусственный интеллект', 'Веб-разработка', 'Мобильная разработка',
            'Блокчейн', 'Робототехника', 'Технологии', 'Кибербезопасность', 'Большие данные',
            'VR/AR', 'Умный дом', 'Дроны', '3D-моделирование', '3D-печать', 'Электроника', 
            
            // Спорт и активности
            'Спорт', 'Футбол', 'Баскетбол', 'Волейбол', 'Бег', 'Плавание', 'Теннис', 'Велоспорт',
            'Йога', 'Пилатес', 'Кроссфит', 'Бодибилдинг', 'Боевые искусства', 'Скалолазание',
            'Сноуборд', 'Горные лыжи', 'Серфинг', 'Хоккей', 'Фигурное катание', 'Шахматы', 'Танцы',
            
            // Стиль жизни
            'Путешествия', 'Медитация', 'Саморазвитие', 'Блоггинг', 'Минимализм', 'Устойчивый образ жизни',
            'Мода', 'Красота', 'Здоровое питание', 'Винтаж', 'Коллекционирование', 'Волонтерство',
            
            // Кулинария и еда
            'Кулинария', 'Выпечка', 'Барбекю', 'Кофе', 'Вино', 'Пивоварение', 'Вегетарианство',
            'Веганство', 'Ресторанная критика', 'Сыроделие', 'Кондитерское искусство',
            
            // Природа и окружающая среда
            'Садоводство', 'Комнатные растения', 'Пермакультура', 'Экология', 'Защита природы',
            'Походы', 'Кемпинг', 'Наблюдение за птицами', 'Рыбалка', 'Охота', 'Астрономия',
            
            // Наука и образование
            'Психология', 'Астрофизика', 'Биология', 'Химия', 'Физика', 'История', 'Археология',
            'Генетика', 'Философия', 'Лингвистика', 'Математика', 'Медицина',
            
            // Творческое письмо
            'Книги', 'Поэзия', 'Писательство', 'Научная фантастика', 'Фэнтези', 'Детективы',
            'Журналистика', 'Комиксы', 'Сценарии', 'Сторителлинг',
            
            // Дизайн и архитектура
            'Дизайн', 'Архитектура', 'Интерьер', 'Ландшафтный дизайн', 'Промышленный дизайн',
            'Дизайн одежды', 'Мебельный дизайн', 'Урбанистика',
            
            // Хобби и развлечения
            'Настольные игры', 'Видеоигры', 'Головоломки', 'Косплей', 'Аниме', 'Комиксы',
            'Фотосъемка', 'Кроссворды', 'Судоку', 'Моделирование', 'Караоке'
        ];
        
        // Специальные обработчики для определенных запросов
        if (query.toLowerCase() === 'питон' || query.toLowerCase() === 'python') {
            return ['Программирование', 'Искусственный интеллект', 'Веб-разработка'];
        }
        
        // Простой алгоритм для извлечения тегов из запроса
        const extractedTags = [];
        const queryLower = query.toLowerCase();
        
        allPossibleTags.forEach(tag => {
            if (queryLower.includes(tag.toLowerCase())) {
                extractedTags.push(tag);
            }
        });
        
        // Простой анализ запроса на основе ключевых слов
        const keywords = {
            // Искусство и творчество
            'фото': 'Фотография',
            'фотограф': 'Фотография',
            'снимать': 'Фотография',
            'камера': 'Фотография',
            'съемка': 'Фотография',
            'рисов': 'Рисование',
            'холст': 'Живопись',
            'краск': 'Живопись',
            'худож': 'Живопись',
            'творч': 'Искусство',
            'иллюстр': 'Иллюстрация',
            'эскиз': 'Рисование',
            'набрасыв': 'Рисование',
            'скульпт': 'Скульптура',
            'лепк': 'Скульптура',
            'глин': 'Керамика',
            'анимац': 'Анимация',
            'мультик': 'Анимация',
            'кино': 'Кино',
            'фильм': 'Кино',
            'театр': 'Театр',
            'спектакл': 'Театр',
            'пьес': 'Театр',
            'графич': 'Графический дизайн',
            'шрифт': 'Каллиграфия',
            'почерк': 'Каллиграфия',
            'оригами': 'Оригами',
            'бумаг': 'Оригами',
            'квилл': 'Квиллинг',
            'вязан': 'Вязание',
            'спиц': 'Вязание',
            'крючок': 'Вязание',
            'вышив': 'Вышивание',
            'шить': 'Рукоделие',
            'рукодел': 'Рукоделие',
            'цифров': 'Цифровое искусство',
            
            // Музыка
            'музык': 'Музыка',
            'пианино': 'Фортепиано',
            'фортепиано': 'Фортепиано',
            'гитар': 'Гитара',
            'бараба': 'Барабаны',
            'ударн': 'Барабаны',
            'скрипк': 'Скрипка',
            'виолончел': 'Виолончель',
            'саксоф': 'Саксофон',
            'аккорд': 'Аккордеон',
            'пени': 'Пение',
            'вокал': 'Вокал',
            'пою': 'Вокал',
            'компози': 'Композиция',
            'битмейк': 'Продюсирование',
            'продюс': 'Продюсирование',
            'диджей': 'DJ',
            'dj': 'DJ',
            'электрон': 'Электронная музыка',
            
            // Технологии
            'программ': 'Программирование',
            'код': 'Программирование',
            'разработ': 'Программирование',
            'python': 'Программирование',
            'питон': 'Программирование',
            'javascript': 'Программирование',
            'java': 'Программирование',
            'c++': 'Программирование',
            'c#': 'Программирование',
            'искусств': 'Искусственный интеллект',
            'нейрон': 'Искусственный интеллект',
            'ai': 'Искусственный интеллект',
            'веб': 'Веб-разработка',
            'сайт': 'Веб-разработка',
            'мобиль': 'Мобильная разработка',
            'приложен': 'Мобильная разработка',
            'блокчейн': 'Блокчейн',
            'крипт': 'Блокчейн',
            'робот': 'Робототехника',
            'технич': 'Технологии',
            'технолог': 'Технологии',
            'кибер': 'Кибербезопасность',
            'безопас': 'Кибербезопасность',
            'данн': 'Большие данные',
            'big data': 'Большие данные',
            'vr': 'VR/AR',
            'ar': 'VR/AR',
            'виртуал': 'VR/AR',
            'дополнен': 'VR/AR',
            'умный дом': 'Умный дом',
            'смарт хом': 'Умный дом',
            'дрон': 'Дроны',
            'квадрокоптер': 'Дроны',
            '3d': '3D-моделирование',
            'модел': '3D-моделирование',
            'печат': '3D-печать',
            'электрон': 'Электроника',
            'схем': 'Электроника',
            'платы': 'Электроника',
            
            // Путешествия и стиль жизни
            'путешеств': 'Путешествия',
            'поездк': 'Путешествия',
            'туризм': 'Путешествия',
            'медит': 'Медитация',
            'осознан': 'Медитация',
            'развити': 'Саморазвитие',
            'самораз': 'Саморазвитие',
            'блог': 'Блоггинг',
            'запис': 'Блоггинг',
            'минимал': 'Минимализм',
            'устойч': 'Устойчивый образ жизни',
            'экологичн': 'Устойчивый образ жизни',
            'мод': 'Мода',
            'стил': 'Мода',
            'красот': 'Красота',
            'уход': 'Красота',
            'здоров': 'Здоровое питание',
            'питани': 'Здоровое питание',
            'винтаж': 'Винтаж',
            'ретро': 'Винтаж',
            'коллекц': 'Коллекционирование',
            'собира': 'Коллекционирование',
            'волонт': 'Волонтерство',
            'помощ': 'Волонтерство',
            
            // Спорт
            'спорт': 'Спорт',
            'футбол': 'Футбол',
            'баскетбол': 'Баскетбол',
            'волейбол': 'Волейбол',
            'бег': 'Бег',
            'бега': 'Бег',
            'плава': 'Плавание',
            'теннис': 'Теннис',
            'велосипе': 'Велоспорт',
            'велогон': 'Велоспорт',
            'йог': 'Йога',
            'пилат': 'Пилатес',
            'кроссфи': 'Кроссфит',
            'бодибилд': 'Бодибилдинг',
            'треняж': 'Бодибилдинг',
            'боев': 'Боевые искусства',
            'борьб': 'Боевые искусства',
            'скалола': 'Скалолазание',
            'альпини': 'Скалолазание',
            'сноубор': 'Сноуборд',
            'горн': 'Горные лыжи',
            'лыж': 'Горные лыжи',
            'серфин': 'Серфинг',
            'хокке': 'Хоккей',
            'фигур': 'Фигурное катание',
            'шахмат': 'Шахматы',
            'танц': 'Танцы',
            'танец': 'Танцы',
            
            // Кулинария и еда
            'готов': 'Кулинария',
            'кулинар': 'Кулинария',
            'еда': 'Кулинария',
            'выпеч': 'Выпечка',
            'пирог': 'Выпечка',
            'торт': 'Выпечка',
            'барбек': 'Барбекю',
            'гриль': 'Барбекю',
            'кофе': 'Кофе',
            'вин': 'Вино',
            'пиво': 'Пивоварение',
            'вари': 'Пивоварение',
            'вегетар': 'Вегетарианство',
            'вега': 'Веганство',
            'ресторан': 'Ресторанная критика',
            'сыр': 'Сыроделие',
            'конди': 'Кондитерское искусство',
            'десерт': 'Кондитерское искусство',
            
            // Природа и окружающая среда
            'сад': 'Садоводство',
            'растен': 'Садоводство',
            'комнат': 'Комнатные растения',
            'цвет': 'Комнатные растения',
            'пермакул': 'Пермакультура',
            'экол': 'Экология',
            'защит': 'Защита природы',
            'природ': 'Защита природы',
            'поход': 'Походы',
            'турист': 'Походы',
            'кемпин': 'Кемпинг',
            'птиц': 'Наблюдение за птицами',
            'рыбал': 'Рыбалка',
            'охот': 'Охота',
            'астрон': 'Астрономия',
            'звезд': 'Астрономия',
            'косм': 'Астрономия',
            
            // Наука и образование
            'психолог': 'Психология',
            'астрофи': 'Астрофизика',
            'биолог': 'Биология',
            'хими': 'Химия',
            'физик': 'Физика',
            'исто': 'История',
            'археол': 'Археология',
            'генет': 'Генетика',
            'филосо': 'Философия',
            'лингв': 'Лингвистика',
            'язык': 'Лингвистика',
            'матем': 'Математика',
            'медиц': 'Медицина',
            'врач': 'Медицина',
            
            // Творческое письмо
            'книг': 'Книги',
            'чтени': 'Книги',
            'литератур': 'Книги',
            'поэз': 'Поэзия',
            'стих': 'Поэзия',
            'писат': 'Писательство',
            'фантас': 'Научная фантастика',
            'фэнтез': 'Фэнтези',
            'детект': 'Детективы',
            'журнал': 'Журналистика',
            'комикс': 'Комиксы',
            'сценар': 'Сценарии',
            'сторит': 'Сторителлинг',
            
            // Дизайн и архитектура 
            'дизайн': 'Дизайн',
            'архитектур': 'Архитектура',
            'здани': 'Архитектура',
            'интерьер': 'Интерьер',
            'ландшафт': 'Ландшафтный дизайн',
            'промыш': 'Промышленный дизайн',
            'одежд': 'Дизайн одежды',
            'мебел': 'Мебельный дизайн',
            'урбан': 'Урбанистика',
            'город': 'Урбанистика',
            
            // Хобби и развлечения
            'настол': 'Настольные игры',
            'видеоигр': 'Видеоигры',
            'игр': 'Видеоигры',
            'головолом': 'Головоломки',
            'косплей': 'Косплей',
            'аниме': 'Аниме',
            'фотосъем': 'Фотосъемка',
            'кроссв': 'Кроссворды',
            'судоку': 'Судоку',
            'модел': 'Моделирование',
            'караоке': 'Караоке'
        };
        
        // Проверяем ключевые слова
        for (const [keyword, tag] of Object.entries(keywords)) {
            if (queryLower.includes(keyword) && !extractedTags.includes(tag)) {
                extractedTags.push(tag);
            }
        }
        
        return extractedTags;
    }
    
    // Функция для отображения результатов поиска
    function displayResults(users, highlightedTags = []) {
        // Clear current results
        resultsContainer.innerHTML = '';
        
        if (users.length === 0) {
            // Если результатов нет, показываем соответствующее сообщение
            if (noResultsMessage) {
                noResultsMessage.style.display = 'block';
            }
            if (loadMoreButton) {
                loadMoreButton.style.display = 'none';
            }
            
            // Обновляем высоту контейнера
            const resultsSection = document.getElementById('results-section');
            if (resultsSection) {
                resultsSection.style.height = 'auto';
            }
            
            return;
        }
        
        // Скрываем сообщение об отсутствии результатов
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
        
        // Определяем, сколько результатов показывать
        const displayLimit = highlightedTags && highlightedTags.length > 0 ? 
            maxDisplayResultsForTagMatch : maxDisplayResults;
        
        // Ограничиваем количество отображаемых результатов
        const displayUsers = users.slice(0, displayLimit);
        
        // Создаем карточки пользователей
        displayUsers.forEach(user => {
            const userCard = createUserCard(user, highlightedTags);
            resultsContainer.appendChild(userCard);
        });
        
        // Показываем или скрываем кнопку "Загрузить еще"
        if (loadMoreButton) {
            if (users.length > displayLimit) {
                loadMoreButton.style.display = 'block';
            } else {
                loadMoreButton.style.display = 'none';
                
                // Если результатов мало, то добавляем сообщение
                if (users.length <= 3) {
                    const endOfResultsMessage = document.createElement('div');
                    endOfResultsMessage.className = 'end-of-results';
                    endOfResultsMessage.textContent = 'Все результаты загружены';
                    resultsContainer.insertAdjacentElement('afterend', endOfResultsMessage);
                }
            }
        }
        
        // Обновляем высоту контейнера
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.style.height = 'auto';
        }
    }

    // Обновляем функцию createUserCard для поддержки подсветки тегов
    function createUserCard(user, highlightedTags = []) {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.setAttribute('data-id', user.id);
        
        // Устанавливаем стили видимости по умолчанию
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        
        // Устанавливаем z-index для правильного отображения при наведении
        // Z-index будет меньше для последующих карточек, чтобы верхние всегда перекрывали нижние
        const currentCards = document.querySelectorAll('.user-card').length;
        card.style.zIndex = 10 - currentCards;
        
        // Добавляем подсветку карточки, если у пользователя есть хотя бы один подсвеченный тег
        if (highlightedTags && highlightedTags.length > 0 && user.interests) {
            const hasMatchingTag = user.interests.some(interest => 
                highlightedTags.some(tag => 
                    interest.toLowerCase().includes(tag.toLowerCase()) || 
                    tag.toLowerCase().includes(interest.toLowerCase())
                )
            );
            if (hasMatchingTag) {
                card.classList.add('highlighted-card');
            }
        }
        
        // Генерируем HTML карточки
        const avatarUrl = user.avatar || 'https://via.placeholder.com/80?text=' + user.name.charAt(0);
        
        // Форматируем данные пользователя
        const formattedName = formatUserText(user.name, 25);
        const formattedLocation = formatUserText(user.location || 'Не указано', 30);
        const formattedBio = formatUserBio(user.bio);
        
        // Создаем HTML для карточки
        card.innerHTML = `
            <div class="card-content">
                <div class="user-avatar">
                    <img src="${avatarUrl}" alt="${formattedName}" onerror="this.onerror=null; this.src='https://via.placeholder.com/80?text=${user.name.charAt(0)}';">
                </div>
                <div class="user-info">
                    <div class="card-top">
                        <h3 class="user-name">${formattedName}</h3>
                        <p class="user-location"><i class="fa-solid fa-location-dot"></i>${formattedLocation}</p>
                    </div>
                    
                    <div class="card-middle">
                        <div class="user-interests">
                            ${formatUserInterests(user.interests, highlightedTags)}
                        </div>
                        ${formattedBio ? `<p class="user-bio">${formattedBio}</p>` : ''}
                    </div>
                    
                    <div class="card-bottom">
                        <div class="card-actions">
                            <button class="message-btn" data-id="${user.id}">Написать</button>
                            <button class="view-profile-btn" data-id="${user.id}">Профиль</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем обработчики событий для кнопок
        const messageBtn = card.querySelector('.message-btn');
        if (messageBtn) {
            messageBtn.addEventListener('click', function() {
                handleConnectClick(parseInt(this.getAttribute('data-id')));
            });
        }
        
        const profileBtn = card.querySelector('.view-profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', function() {
                handleViewProfileClick(parseInt(this.getAttribute('data-id')));
            });
        }
        
        return card;
    }

    // Форматирование текста с ограничением длины
    function formatUserText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Форматирование био пользователя
    function formatUserBio(bio) {
        if (!bio) return '';
        // Очищаем от лишних пробелов и переносов
        const cleanBio = bio.replace(/\s+/g, ' ').trim();
        // Строго ограничиваем длину до 80 символов для лучшего отображения
        return cleanBio.length > 80 ? cleanBio.substring(0, 80) + '...' : cleanBio;
    }

    // Вспомогательная функция для форматирования тегов пользователя
    function formatUserInterests(interests, highlightedTags = []) {
        if (!interests || interests.length === 0) {
            return '<span class="no-interests">Интересы не указаны</span>';
        }
        
        // Ограничиваем количество отображаемых тегов до 5
        const visibleTags = interests.slice(0, 5);
        let tagsHtml = '';
        
        // Создаем HTML для видимых тегов
        visibleTags.forEach(interest => {
            const isHighlighted = highlightedTags && highlightedTags.some(tag => 
                interest.toLowerCase().includes(tag.toLowerCase()) || 
                tag.toLowerCase().includes(interest.toLowerCase())
            );
            tagsHtml += `<span class="interest-tag${isHighlighted ? ' highlight' : ''}">${interest}</span>`;
        });
        
        return tagsHtml;
    }

    // ... existing code ...

    // Обновляем обработчик для кнопки добавления тега
    addTagBtn.addEventListener('click', function(e) {
        e.preventDefault();
        toggleTagSelector();
    });

    // ... existing code ...

    // Список всех возможных тегов, разделенных по категориям
    const allPossibleTags = {
        "Искусство": ["Живопись", "Фотография", "Скульптура", "Архитектура", "Рисование", "Графика", "Театр", "Кино", "Анимация", "Стрит-арт"],
        "Музыка": ["Рок", "Поп", "Классическая", "Джаз", "Электронная", "Хип-хоп", "Металл", "Инди", "Фолк", "Блюз", "R&B", "Кантри"],
        "Технологии": ["Программирование", "Искусственный интеллект", "Веб-разработка", "Мобильные приложения", "Кибербезопасность", "Робототехника", "Блокчейн", "Виртуальная реальность", "Дополненная реальность", "IoT", "Дизайн интерфейсов"],
        "Спорт": ["Футбол", "Баскетбол", "Теннис", "Плавание", "Йога", "Бег", "Фитнес", "Велоспорт", "Боевые искусства", "Лыжи", "Сноуборд", "Скейтбординг", "Серфинг", "Гольф", "Волейбол"],
        "Образ жизни": ["Путешествия", "Гастрономия", "Мода", "Фитнес", "Саморазвитие", "Медитация", "Минимализм", "Веганство", "Устойчивый образ жизни", "Коучинг", "Волонтёрство"],
        "Кулинария": ["Выпечка", "Вегетарианство", "Барбекю", "Кондитерские изделия", "Здоровое питание", "Кофе", "Вино", "Пивоварение", "Международная кухня", "Органические продукты"],
        "Природа": ["Садоводство", "Туризм", "Кемпинг", "Альпинизм", "Бёрдвотчинг", "Рыбалка", "Охота", "Экология", "Защита животных", "Выживание на природе"],
        "Наука": ["Астрономия", "Биология", "Химия", "Физика", "Математика", "Психология", "Медицина", "Нейробиология", "Генетика", "Экология", "Квантовая механика", "Космос"],
        "Литература": ["Фантастика", "Фэнтези", "Научная литература", "Классическая литература", "Поэзия", "Детективы", "Биографии", "Историческая проза", "Психология", "Философия", "Триллеры"],
        "Дизайн": ["Графический дизайн", "Промышленный дизайн", "Дизайн интерьера", "UX/UI дизайн", "Веб-дизайн", "Мода", "Иллюстрация", "Типография", "3D моделирование", "Ландшафтный дизайн"],
        "Хобби": ["Коллекционирование", "Настольные игры", "DIY", "Рукоделие", "Вязание", "Шитье", "Моделирование", "Каллиграфия", "Оригами", "Пазлы", "Садоводство", "Горные лыжи", "Реставрация"]
    };

    // Заменяем существующий обработчик кнопки добавления тега
    document.querySelector('.add-tag-btn').addEventListener('click', function(e) {
        e.preventDefault();
        toggleTagSelector();
    });

    // Функция для открытия/закрытия селектора тегов
    function toggleTagSelector() {
        // Проверяем, существует ли уже селектор тегов
        const existingSelector = document.querySelector('.tag-selector');
        
        if (existingSelector) {
            // Если селектор уже открыт, закрываем его
            existingSelector.remove();
            return;
        }
        
        // Получаем текущие активные теги
        const activeTags = getActiveTags();
        
        // Создаем новый селектор тегов
        const tagSelector = createTagSelector(activeTags);
        
        // Добавляем селектор в DOM
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.appendChild(tagSelector);
            
            // Фокусируемся на поле поиска
            setTimeout(() => {
                const searchInput = tagSelector.querySelector('.tag-search-input');
                if (searchInput) searchInput.focus();
            }, 100);
        }
        
        // Обработчик клика вне селектора для его закрытия
        document.addEventListener('click', function closeOnClickOutside(e) {
            const tagSelector = document.querySelector('.tag-selector');
            if (tagSelector && !tagSelector.contains(e.target) && e.target !== document.querySelector('.add-tag-btn')) {
                tagSelector.remove();
                document.removeEventListener('click', closeOnClickOutside);
            }
        });
    }

    // Функция для создания селектора тегов
    function createTagSelector(activeTags) {
        const tagSelector = document.createElement('div');
        tagSelector.className = 'tag-selector';
        
        // Создаем заголовок
        const header = document.createElement('div');
        header.className = 'tag-selector-header';
        
        const title = document.createElement('h4');
        title.textContent = 'Выберите интересующие вас теги';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-selector btn btn-sm btn-light';
        closeButton.textContent = 'Закрыть';
        closeButton.addEventListener('click', () => tagSelector.remove());
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // Создаем поле поиска
        const searchContainer = document.createElement('div');
        searchContainer.className = 'tag-search';
        
        const searchInput = document.createElement('input');
        searchInput.className = 'tag-search-input';
        searchInput.type = 'text';
        searchInput.placeholder = 'Поиск тегов...';
        
        searchContainer.appendChild(searchInput);
        
        // Создаем контейнер для тегов
        const tagsGrid = document.createElement('div');
        tagsGrid.className = 'tags-grid';
        
        // Собираем селектор
        tagSelector.appendChild(header);
        tagSelector.appendChild(searchContainer);
        tagSelector.appendChild(tagsGrid);
        
        // Заполняем теги
        populateTagsGrid(tagsGrid, activeTags);
        
        // Добавляем обработчик для поиска тегов
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            populateTagsGrid(tagsGrid, activeTags, searchTerm);
        });
        
        return tagSelector;
    }

    // Функция для заполнения сетки тегов с учетом фильтрации
    function populateTagsGrid(tagsGrid, activeTags, searchTerm = '') {
        // Очищаем текущее содержимое
        tagsGrid.innerHTML = '';
        
        let foundTags = false;
        
        // Перебираем все категории и их теги
        for (const [category, tags] of Object.entries(allPossibleTags)) {
            // Фильтруем теги по поисковому запросу
            const filteredTags = searchTerm ? 
                tags.filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) : 
                tags;
            
            if (filteredTags.length === 0) continue;
            
            foundTags = true;
            
            // Добавляем заголовок категории (если есть подходящие теги и не пустой поисковый запрос)
            if (!searchTerm || filteredTags.length > 0) {
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-header';
                categoryHeader.textContent = category;
                categoryHeader.style.gridColumn = '1 / -1';
                categoryHeader.style.marginTop = '10px';
                categoryHeader.style.marginBottom = '5px';
                categoryHeader.style.fontWeight = 'bold';
                categoryHeader.style.color = '#444';
                categoryHeader.style.fontSize = '14px';
                tagsGrid.appendChild(categoryHeader);
            }
            
            // Добавляем теги
            filteredTags.forEach(tag => {
                const tagOption = document.createElement('div');
                tagOption.className = 'tag-option';
                tagOption.textContent = tag;
                
                // Проверяем, активен ли тег
                if (activeTags.includes(tag)) {
                    tagOption.classList.add('selected');
                }
                
                // Добавляем обработчик клика
                tagOption.addEventListener('click', function() {
                    if (this.classList.contains('selected')) {
                        // Если тег уже выбран, удаляем его
                        this.classList.remove('selected');
                        removeTag(tag);
                    } else {
                        // Если тег не выбран, добавляем его
                        this.classList.add('selected');
                        addTag(tag);
                    }
                });
                
                tagsGrid.appendChild(tagOption);
            });
        }
        
        // Если теги не найдены, показываем соответствующее сообщение
        if (!foundTags) {
            const noTags = document.createElement('div');
            noTags.className = 'no-tags';
            noTags.textContent = 'Теги не найдены. Попробуйте другой запрос.';
            tagsGrid.appendChild(noTags);
        }
    }

    // Функция для добавления тега
    function addTag(tagText) {
        // Проверяем, существует ли уже тег с таким текстом
        const existingTags = Array.from(document.querySelectorAll('.tag'));
        if (existingTags.some(tag => tag.textContent === tagText)) {
            return; // Тег уже существует, не добавляем его снова
        }
        
        // Создаем контейнер для тега
        const tagContainer = document.createElement('div');
        tagContainer.className = 'tag-container';
        
        // Создаем элемент тега
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = tagText;
        
        // Создаем кнопку удаления
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-tag-btn';
        removeButton.innerHTML = '&times;';
        removeButton.setAttribute('aria-label', 'Удалить тег');
        
        // Добавляем обработчик для удаления тега
        removeButton.addEventListener('click', function() {
            tagContainer.remove();
            
            // Обновляем селектор тегов, если он открыт
            const tagSelector = document.querySelector('.tag-selector');
            if (tagSelector) {
                const tagOptions = tagSelector.querySelectorAll('.tag-option');
                tagOptions.forEach(option => {
                    if (option.textContent === tagText) {
                        option.classList.remove('selected');
                    }
                });
            }
            
            // Запускаем поиск с обновленными тегами
            filterResultsByActiveTags();
        });
        
        // Собираем тег
        tagContainer.appendChild(tag);
        tagContainer.appendChild(removeButton);
        
        // Добавляем тег в контейнер активных тегов
        const activeTagsContainer = document.querySelector('.active-tags-container');
        activeTagsContainer.appendChild(tagContainer);
        
        // Запускаем поиск с обновленными тегами
        filterResultsByActiveTags();
    }

    // Функция для удаления тега
    function removeTag(tagText) {
        const tags = document.querySelectorAll('.tag');
        
        for (const tag of tags) {
            if (tag.textContent === tagText) {
                tag.parentElement.remove();
                break;
            }
        }
        
        // Запускаем поиск с обновленными тегами
        filterResultsByActiveTags();
    }

    // Функция для получения активных тегов
    function getActiveTags() {
        const tags = document.querySelectorAll('.tag');
        return Array.from(tags).map(tag => tag.textContent);
    }

    // Функция для фильтрации результатов по активным тегам
    function filterResultsByActiveTags() {
        const activeTags = getActiveTags();
        const searchInput = document.getElementById('search-input');
        const query = searchInput ? searchInput.value.trim() : '';
        
        // Показываем индикатор загрузки
        const loadingIndicator = document.querySelector('.loading-indicator');
        loadingIndicator.style.display = 'block';
        
        // Устанавливаем таймаут, чтобы дать время на отображение индикатора загрузки
        setTimeout(() => {
            // Фильтруем пользователей по тегам
            let filteredUsers = users;
            
            if (activeTags.length > 0) {
                filteredUsers = users.filter(user => {
                    // Если у пользователя есть хотя бы один из выбранных тегов, включаем его в результаты
                    return user.interests && user.interests.some(interest => 
                        activeTags.some(tag => 
                            interest.toLowerCase().includes(tag.toLowerCase()) || 
                            tag.toLowerCase().includes(interest.toLowerCase())
                        )
                    );
                });
            }
            
            // Если есть поисковый запрос, дополнительно фильтруем по нему
            if (query) {
                filteredUsers = filteredUsers.filter(user => {
                    return (
                        (user.name && user.name.toLowerCase().includes(query.toLowerCase())) ||
                        (user.location && user.location.toLowerCase().includes(query.toLowerCase())) ||
                        (user.interests && user.interests.some(interest => interest.toLowerCase().includes(query.toLowerCase())))
                    );
                });
            }
            
            // Отображаем результаты
            displayResults(filteredUsers, activeTags);
            
            // Скрываем индикатор загрузки
            loadingIndicator.style.display = 'none';
        }, 300); // Задержка для имитации загрузки
    }

    // ... existing code ...

    // Загрузка дополнительных результатов
    function loadMoreResults() {
        // Получаем текущий запрос и теги
        const query = searchInput.value.trim().toLowerCase();
        const activeTags = getActiveTags();
        
        // Показываем индикатор загрузки
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<span></span><span></span><span></span>';
        loadMoreButton.insertAdjacentElement('afterend', loadingIndicator);
        loadMoreButton.style.display = 'none';
        
        // Имитируем время загрузки
        setTimeout(() => {
            // Получаем уже отображаемых пользователей
            const displayedUsers = Array.from(document.querySelectorAll('.user-card')).map(card => {
                return parseInt(card.getAttribute('data-id'));
            });
            
            // Находим всех пользователей, которые подходят по запросу и тегам
            let filteredUsers = [];
            
            if (activeTags.length > 0) {
                // Если есть активные теги, фильтруем пользователей по ним
                filteredUsers = users.filter(user => 
                    activeTags.some(tag => 
                        user.interests && user.interests.some(interest => 
                            interest.toLowerCase().includes(tag.toLowerCase()) ||
                            tag.toLowerCase().includes(interest.toLowerCase())
                        )
                    )
                );
            } else if (query) {
                // Если нет активных тегов, но есть запрос, фильтруем по запросу
                filteredUsers = users.filter(user => 
                    (user.name && user.name.toLowerCase().includes(query.toLowerCase())) || 
                    (user.location && user.location.toLowerCase().includes(query.toLowerCase())) ||
                    (user.interests && user.interests.some(interest => interest.toLowerCase().includes(query.toLowerCase()))) ||
                    (user.bio && user.bio.toLowerCase().includes(query.toLowerCase()))
                );
            } else {
                // Если нет ни тегов, ни запроса, отображаем всех пользователей
                filteredUsers = users;
            }
            
            // Исключаем уже отображаемых пользователей
            const remainingUsers = filteredUsers.filter(user => !displayedUsers.includes(user.id));
            
            // Определяем, сколько результатов показывать
            const displayLimit = activeTags && activeTags.length > 0 ? 
                maxDisplayResultsForTagMatch : maxDisplayResults;
            
            // Определяем следующую порцию пользователей
            const nextUsers = remainingUsers.slice(0, displayLimit);
            
            // Удаляем индикатор загрузки
            loadingIndicator.remove();
            
            // Удаляем все предыдущие сообщения о конце результатов, если они есть
            const existingEndMessages = document.querySelectorAll('.end-of-results');
            existingEndMessages.forEach(msg => msg.remove());
            
            if (nextUsers.length > 0) {
                // Добавляем новые карточки пользователей
                nextUsers.forEach(user => {
                    const userCard = createUserCard(user, activeTags);
                    resultsContainer.appendChild(userCard);
                });
                
                // Если еще остались пользователи, оставляем кнопку "Загрузить еще"
                if (remainingUsers.length > nextUsers.length) {
                    loadMoreButton.style.display = 'block';
                } else {
                    // Добавляем сообщение о конце результатов
                    const endOfResultsMessage = document.createElement('div');
                    endOfResultsMessage.className = 'end-of-results';
                    endOfResultsMessage.textContent = 'Все результаты загружены';
                    loadMoreButton.insertAdjacentElement('afterend', endOfResultsMessage);
                }
            } else {
                // Добавляем сообщение о конце результатов
                const endOfResultsMessage = document.createElement('div');
                endOfResultsMessage.className = 'end-of-results';
                endOfResultsMessage.textContent = 'Все результаты загружены';
                loadMoreButton.insertAdjacentElement('afterend', endOfResultsMessage);
            }
            
            // Обновляем высоту контейнера, если необходимо
            const resultsSection = document.getElementById('results-section');
            if (resultsSection) {
                resultsSection.style.height = 'auto';
            }
        }, 800); // Имитация задержки сети
    }
}); 
