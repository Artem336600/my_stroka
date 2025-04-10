/**
 * Сервис для интеграции с авторизацией Telegram
 */
class TelegramAuthService {
    constructor() {
        this.apiEndpoint = 'https://api.telegram.org';
        this.authRequests = new Map(); // хранит текущие запросы на авторизацию
        this.tg = window.Telegram?.WebApp;
        this.isInitialized = false;
        this.onConfirm = null; // Обработчик подтверждения
        this.onReject = null; // Обработчик отклонения
    }

    /**
     * Инициализирует сервис авторизации Telegram
     */
    initialize() {
        if (this.isInitialized) return;
        
        // Проверка наличия Telegram WebApp API
        if (!this.tg) {
            console.warn('Telegram WebApp API не обнаружен. Используется демо-режим.');
            // Продолжаем работу без Telegram API в демо-режиме
        } else {
            // Настройка обработчиков событий Telegram WebApp
            this.setupEventListeners();
        }
        
        // Инициализация завершена
        this.isInitialized = true;
        console.log('TelegramAuthService инициализирован');
    }

    /**
     * Настраивает обработчики событий для Telegram WebApp
     */
    setupEventListeners() {
        // Проверяем наличие Telegram WebApp API и свойства isExpanded
        if (this.tg && typeof this.tg.isExpanded !== 'undefined') {
            try {
                // Обработка событий внутри Telegram WebApp
                if (typeof this.tg.onEvent === 'function') {
                    this.tg.onEvent('viewportChanged', this.handleViewportChange.bind(this));
                    this.tg.onEvent('themeChanged', this.applyTelegramTheme.bind(this));
                }
            } catch (error) {
                console.warn('Ошибка при настройке обработчиков Telegram WebApp:', error);
            }
        }
    }

    /**
     * Обрабатывает изменение размера окна Telegram WebApp
     */
    handleViewportChange(event) {
        // Обработка изменения размера окна в Telegram WebApp
        console.log('Изменение размера окна:', event);
    }

    /**
     * Применяет тему Telegram к интерфейсу приложения
     */
    applyTelegramTheme() {
        if (!this.tg) return;
        
        try {
            const theme = this.tg.colorScheme || 'light';
            document.body.setAttribute('data-theme', theme);
            
            // Применяем цвета из Telegram
            if (this.tg.themeParams) {
                document.documentElement.style.setProperty('--tg-theme-bg-color', this.tg.themeParams.bg_color);
                document.documentElement.style.setProperty('--tg-theme-text-color', this.tg.themeParams.text_color);
                document.documentElement.style.setProperty('--tg-theme-hint-color', this.tg.themeParams.hint_color);
                document.documentElement.style.setProperty('--tg-theme-link-color', this.tg.themeParams.link_color);
                document.documentElement.style.setProperty('--tg-theme-button-color', this.tg.themeParams.button_color);
                document.documentElement.style.setProperty('--tg-theme-button-text-color', this.tg.themeParams.button_text_color);
            }
        } catch (error) {
            console.warn('Ошибка при применении темы Telegram:', error);
        }
    }

    /**
     * Создает запрос на авторизацию пользователя через Telegram
     * @param {string} phoneNumber - Номер телефона пользователя
     * @returns {Promise<string>} ID запроса на авторизацию
     */
    createAuthRequest(phoneNumber) {
        return new Promise((resolve, reject) => {
            // Валидация номера телефона
            if (!this.validatePhoneNumber(phoneNumber)) {
                reject(new Error('Неверный формат номера телефона'));
                return;
            }

            // В реальном приложении здесь был бы запрос к бэкенду
            // Для демо просто генерируем ID запроса
            const requestId = this.generateRequestId();
            
            // Сохраняем запрос в карту запросов
            this.authRequests.set(requestId, {
                phoneNumber,
                status: 'pending',
                timestamp: Date.now(),
                callbacks: {
                    onConfirm: null,
                    onReject: null
                }
            });

            // Имитация отправки запроса в Telegram
            console.log(`Отправлен запрос на авторизацию для номера ${phoneNumber}, ID: ${requestId}`);
            
            // В реальном приложении здесь бы выполнялся API запрос
            setTimeout(() => {
                // Для демонстрации автоматически переводим запрос в статус "отправлен"
                const request = this.authRequests.get(requestId);
                if (request) {
                    request.status = 'sent';
                    this.authRequests.set(requestId, request);
                }
            }, 1500);

            resolve(requestId);
        });
    }

    /**
     * Проверяет статус запроса на авторизацию
     * @param {string} requestId - ID запроса на авторизацию
     * @returns {Promise<Object>} Объект с информацией о статусе запроса
     */
    checkAuthRequestStatus(requestId) {
        return new Promise((resolve, reject) => {
            const request = this.authRequests.get(requestId);
            
            if (!request) {
                reject(new Error('Запрос на авторизацию не найден'));
                return;
            }

            // В реальном приложении здесь был бы запрос к API
            resolve({
                status: request.status,
                timestamp: request.timestamp,
                phoneNumber: request.phoneNumber
            });
        });
    }

    /**
     * Устанавливает обработчики для подтверждения и отклонения запроса
     * @param {string} requestId - ID запроса на авторизацию
     * @param {Function} onConfirm - Обработчик подтверждения
     * @param {Function} onReject - Обработчик отклонения
     */
    setAuthRequestCallbacks(requestId, onConfirm, onReject) {
        const request = this.authRequests.get(requestId);
        
        if (!request) {
            console.error('Запрос на авторизацию не найден');
            return false;
        }

        request.callbacks = {
            onConfirm: onConfirm || null,
            onReject: onReject || null
        };
        
        this.authRequests.set(requestId, request);
        return true;
    }

    /**
     * Подтверждает запрос на авторизацию (для демонстрации)
     * @param {string} requestId - ID запроса на авторизацию
     * @returns {Promise<Object>} Данные пользователя
     */
    confirmAuthRequest(requestId) {
        return new Promise((resolve, reject) => {
            const request = this.authRequests.get(requestId);
            
            if (!request) {
                reject(new Error('Запрос на авторизацию не найден'));
                return;
            }

            // Обновляем статус запроса
            request.status = 'confirmed';
            this.authRequests.set(requestId, request);
            
            // Генерируем данные пользователя для демонстрации
            const userData = {
                id: this.generateUserId(),
                phoneNumber: request.phoneNumber,
                username: this.generateUsername(request.phoneNumber),
                firstName: 'Пользователь',
                lastName: 'Telegram',
                authDate: Math.floor(Date.now() / 1000),
                userId: this.generateUserId() // Добавляем для совместимости
            };

            // Вызываем обработчик подтверждения, если он установлен
            if (request.callbacks.onConfirm) {
                request.callbacks.onConfirm(userData);
            }
            
            // Вызываем глобальный обработчик, если он установлен
            if (typeof this.onConfirm === 'function') {
                this.onConfirm(requestId);
            }

            resolve(userData);
        });
    }

    /**
     * Отклоняет запрос на авторизацию (для демонстрации)
     * @param {string} requestId - ID запроса на авторизацию
     * @returns {Promise<void>}
     */
    rejectAuthRequest(requestId) {
        return new Promise((resolve, reject) => {
            const request = this.authRequests.get(requestId);
            
            if (!request) {
                reject(new Error('Запрос на авторизацию не найден'));
                return;
            }

            // Обновляем статус запроса
            request.status = 'rejected';
            this.authRequests.set(requestId, request);
            
            // Вызываем обработчик отклонения, если он установлен
            if (request.callbacks.onReject) {
                request.callbacks.onReject();
            }
            
            // Вызываем глобальный обработчик, если он установлен
            if (typeof this.onReject === 'function') {
                this.onReject(requestId);
            }

            resolve();
        });
    }

    /**
     * Удаляет запрос на авторизацию
     * @param {string} requestId - ID запроса на авторизацию
     * @returns {boolean} Успешно ли удален запрос
     */
    removeAuthRequest(requestId) {
        return this.authRequests.delete(requestId);
    }

    /**
     * Проверяет формат номера телефона
     * @param {string} phoneNumber - Номер телефона
     * @returns {boolean} Корректный ли формат номера
     */
    validatePhoneNumber(phoneNumber) {
        // Простая проверка: должен начинаться с + и содержать только цифры
        try {
            const cleanNumber = phoneNumber.replace(/[\s\-()]/g, '');
            return /^\+[0-9]{10,15}$/.test(cleanNumber);
        } catch (e) {
            console.error('Ошибка при валидации номера телефона:', e);
            return false;
        }
    }

    /**
     * Генерирует уникальный ID запроса
     * @returns {string} Уникальный ID
     */
    generateRequestId() {
        return 'req_' + Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    /**
     * Генерирует уникальный ID пользователя
     * @returns {string} Уникальный ID
     */
    generateUserId() {
        return 'user_' + Math.random().toString(36).substring(2, 12);
    }

    /**
     * Генерирует имя пользователя на основе номера телефона
     * @param {string} phoneNumber - Номер телефона
     * @returns {string} Имя пользователя
     */
    generateUsername(phoneNumber) {
        try {
            // Создаем псевдоним на основе последних цифр номера телефона
            const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
            return 'user' + cleanNumber.substr(-5);
        } catch (e) {
            console.error('Ошибка при генерации имени пользователя:', e);
            return 'user' + Math.floor(Math.random() * 10000);
        }
    }
}

// Экспортируем класс для использования в других файлах
window.TelegramAuthService = TelegramAuthService; 