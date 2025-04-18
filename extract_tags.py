from flask import Flask, request, jsonify
import json
import re
from openai import OpenAI

app = Flask(__name__, static_folder='.', static_url_path='')

# API ключ для DeepSeek
DEEPSEEK_API_KEY = "sk-4343a8699fd7460d98903b12836a4627"

# Инициализация клиента DeepSeek
client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")

# Список доступных тегов/интересов
AVAILABLE_TAGS = [
    # Искусство и творчество
    'Фотография', 'Живопись', 'Графический дизайн', 'Скульптура', 'Каллиграфия', 'Рисование', 
    'Керамика', 'Рукоделие', 'Квиллинг', 'Оригами', 'Вязание', 'Вышивание', 'Анимация',
    'Искусство', 'Иллюстрация', 'Видеомонтаж', 'Кино', 'Театр', 'Цифровое искусство',
    
    # Музыка
    'Музыка', 'Гитара', 'Фортепиано', 'Барабаны', 'Скрипка', 'Пение', 'Вокал', 'Композиция',
    'DJ', 'Продюсирование', 'Саксофон', 'Аккордеон', 'Виолончель', 'Электронная музыка',
    
    # Технологии
    'Программирование', 'Искусственный интеллект', 'Веб-разработка', 'Мобильная разработка',
    'Блокчейн', 'Робототехника', 'Технологии', 'Кибербезопасность', 'Большие данные',
    'VR/AR', 'Умный дом', 'Дроны', '3D-моделирование', '3D-печать', 'Электроника', 
    
    # Спорт и активности
    'Спорт', 'Футбол', 'Баскетбол', 'Волейбол', 'Бег', 'Плавание', 'Теннис', 'Велоспорт',
    'Йога', 'Пилатес', 'Кроссфит', 'Бодибилдинг', 'Боевые искусства', 'Скалолазание',
    'Сноуборд', 'Горные лыжи', 'Серфинг', 'Хоккей', 'Фигурное катание', 'Шахматы', 'Танцы',
    
    # Стиль жизни
    'Путешествия', 'Медитация', 'Саморазвитие', 'Блоггинг', 'Минимализм', 'Устойчивый образ жизни',
    'Мода', 'Красота', 'Здоровое питание', 'Винтаж', 'Коллекционирование', 'Волонтерство',
    
    # Кулинария и еда
    'Кулинария', 'Выпечка', 'Барбекю', 'Кофе', 'Вино', 'Пивоварение', 'Вегетарианство',
    'Веганство', 'Ресторанная критика', 'Сыроделие', 'Кондитерское искусство',
    
    # Природа и окружающая среда
    'Садоводство', 'Комнатные растения', 'Пермакультура', 'Экология', 'Защита природы',
    'Походы', 'Кемпинг', 'Наблюдение за птицами', 'Рыбалка', 'Охота', 'Астрономия',
    
    # Наука и образование
    'Психология', 'Астрофизика', 'Биология', 'Химия', 'Физика', 'История', 'Археология',
    'Генетика', 'Философия', 'Лингвистика', 'Математика', 'Медицина',
    
    # Творческое письмо
    'Книги', 'Поэзия', 'Писательство', 'Научная фантастика', 'Фэнтези', 'Детективы',
    'Журналистика', 'Комиксы', 'Сценарии', 'Сторителлинг',
    
    # Дизайн и архитектура
    'Дизайн', 'Архитектура', 'Интерьер', 'Ландшафтный дизайн', 'Промышленный дизайн',
    'Дизайн одежды', 'Мебельный дизайн', 'Урбанистика',
    
    # Хобби и развлечения
    'Настольные игры', 'Видеоигры', 'Головоломки', 'Косплей', 'Аниме', 'Комиксы',
    'Фотосъемка', 'Кроссворды', 'Судоку', 'Моделирование', 'Караоке'
]

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/extract_tags', methods=['POST'])
def extract_tags():
    data = request.json
    if not data or 'query' not in data:
        return jsonify({'error': 'No query provided'}), 400
    
    query = data['query']
    print(f"Получен запрос: {query}")
    
    try:
        # Используем DeepSeek API для анализа запроса
        extracted_tags = deepseek_extract_tags(query)
        print(f"Извлеченные теги через DeepSeek: {extracted_tags}")
        
        if not extracted_tags:
            # Если DeepSeek не вернул результатов, используем локальное извлечение
            extracted_tags = local_extract_tags(query)
            print(f"Извлеченные теги локально: {extracted_tags}")
    except Exception as e:
        print(f"Ошибка при использовании DeepSeek API: {e}")
        # В случае ошибки используем локальное извлечение
        extracted_tags = local_extract_tags(query)
        print(f"Извлеченные теги локально: {extracted_tags}")
    
    return jsonify({'tags': extracted_tags})

def deepseek_extract_tags(query):
    """Извлечение тегов с использованием DeepSeek API"""
    prompt = f"""
    Проанализируй следующий запрос пользователя и извлеки из него наиболее релевантные теги (интересы).
    
    Запрос: "{query}"
    
    Выбери из следующего списка доступных тегов только те, которые наиболее подходят к запросу пользователя.
    Если запрос связан с программированием, технологиями или Python, обязательно включи соответствующие теги.
    
    Доступные теги:
    {', '.join(AVAILABLE_TAGS)}
    
    Верни только список тегов в формате JSON-массива, без дополнительных комментариев.
    """
    
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "Ты помощник, который анализирует запросы пользователей и выделяет релевантные теги интересов"},
                {"role": "user", "content": prompt}
            ],
            stream=False
        )
        
        content = response.choices[0].message.content
        print(f"Ответ DeepSeek: {content}")
        
        # Обработка ответа и извлечение тегов
        try:
            # Попытка найти JSON в ответе
            tags_match = re.search(r'\[.*?\]', content, re.DOTALL)
            if tags_match:
                tags_json = tags_match.group(0)
                tags = json.loads(tags_json)
                return tags
            
            # Если JSON не найден, ищем теги в формате списка
            tags = []
            for tag in AVAILABLE_TAGS:
                if tag in content:
                    tags.append(tag)
            
            return tags
        except json.JSONDecodeError:
            # Ручной парсинг ответа, если JSON некорректен
            tags = []
            for tag in AVAILABLE_TAGS:
                if tag in content:
                    tags.append(tag)
            
            return tags
    except Exception as e:
        print(f"Ошибка при обращении к DeepSeek API: {e}")
        return []

def local_extract_tags(query):
    """Локальная функция для извлечения тегов из запроса"""
    extracted_tags = []
    query_lower = query.lower()
    
    # Добавляем специальные обработчики для определенных запросов
    if 'питон' in query_lower or 'python' in query_lower:
        extracted_tags.append('Программирование')
        extracted_tags.append('Искусственный интеллект')
        extracted_tags.append('Веб-разработка')
        return extracted_tags
    
    # Прямое сопоставление с тегами
    for tag in AVAILABLE_TAGS:
        if tag.lower() in query_lower:
            extracted_tags.append(tag)
    
    # Ключевые слова для различных тегов
    keywords = {
        # Искусство и творчество
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
        
        # Музыка
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
        
        # Технологии
        'программ': 'Программирование',
        'код': 'Программирование',
        'разработ': 'Программирование',
        'python': 'Программирование',
        'питон': 'Программирование',
        'javascript': 'Программирование',
        'java': 'Программирование',
        'c++': 'Программирование',
        'c#': 'Программирование',
        'php': 'Программирование',
        'ruby': 'Программирование',
        'go': 'Программирование',
        'sql': 'Программирование',
        'html': 'Веб-разработка',
        'css': 'Веб-разработка',
        'искусств': 'Искусственный интеллект',
        'нейрон': 'Искусственный интеллект',
        'ai': 'Искусственный интеллект',
        'машинн': 'Искусственный интеллект',
        'вебдев': 'Веб-разработка',
        'веб': 'Веб-разработка',
        'сайт': 'Веб-разработка',
        'мобиль': 'Мобильная разработка',
        'приложен': 'Мобильная разработка',
        'андроид': 'Мобильная разработка',
        'android': 'Мобильная разработка',
        'ios': 'Мобильная разработка',
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
        
        # Путешествия и стиль жизни
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
        
        # Спорт
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
        'катат': 'Горные лыжи',
        'серфин': 'Серфинг',
        'хокке': 'Хоккей',
        'фигур': 'Фигурное катание',
        'шахмат': 'Шахматы',
        'танц': 'Танцы',
        'танец': 'Танцы',
        
        # Кулинария и еда
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
        
        # Природа и окружающая среда
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
        
        # Наука и образование
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
        
        # Творческое письмо
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
        
        # Дизайн и архитектура 
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
        
        # Хобби и развлечения
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
    }
    
    # Проверяем ключевые слова
    for keyword, tag in keywords.items():
        if keyword in query_lower and tag not in extracted_tags:
            extracted_tags.append(tag)
    
    # Если не нашли ни одного тега, попробуем анализировать отдельные слова в запросе
    if not extracted_tags:
        words = query_lower.split()
        for word in words:
            if len(word) < 3:
                continue  # пропускаем слишком короткие слова
                
            # Проверяем каждое слово по словарю
            for keyword, tag in keywords.items():
                if word.startswith(keyword) and tag not in extracted_tags:
                    extracted_tags.append(tag)
    
    return extracted_tags

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
