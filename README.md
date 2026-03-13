# API тесты для FreeAPI (E-commerce)

## 📋 Описание проекта
Проект содержит автоматизированные API-тесты для [FreeAPI](https://freeapi.hashnode.space/api-guide). 
Тесты покрывают CRUD операции с продуктами, авторизацию, негативные сценарии и продвинутую валидацию.

## 🚀 Технологии
- **Playwright** — фреймворк для тестирования
- **TypeScript** — язык разработки
- **Faker.js** — генерация тестовых данных
- **Ajv** — валидация JSON Schema
- **Allure** — отчетность

## 📁 Структура проекта

api-tests/
├── 📁 fixtures/ # Фикстуры Playwright
│ └── auth_context.ts # Фикстура с токеном авторизации
├── 📁 tests/ # Тесты
│ ├── 📁 products/ # CRUD и негативные тесты продуктов
│ │ ├── products.crud.spec.ts # CRUD операции (create, read, update, delete)
│ │ ├── products.list.spec.ts # Получение списка продуктов
│ │ └── products.negative.spec.ts # Негативные сценарии (400, 401, 404, 422)
│ ├── 📁 auth/ # Тесты авторизации
│ │ └── auth.spec.ts # Регистрация, логин, получение токена
│ └── 📁 advanced/ # Продвинутые тесты
│ ├── products.schema.spec.ts # JSON Schema валидация
│ └── products.parametrized.spec.ts # Параметризованные тесты цен
├── 📁 utils/ # Вспомогательные модули
│ ├── data_generator.ts # Генерация тестовых данных
│ ├── image_helper.ts # Работа с изображениями
│ └── schemas.ts # JSON Schema для валидации
├── 📁 test-data/ # Тестовые изображения
│ ├── main.jpg
│ ├── sub1.jpeg
│ ├── sub2.jpg
│ └── sub3.jpg
├── 📁 data/ # Сохраненные данные
│ └── products_initial.json # Список рандомных продуктов
├── allure-results/ # Сырые данные для Allure (генерируется)
├── allure-report/ # Готовый отчет Allure (генерируется)
├── playwright.config.ts # Конфигурация Playwright
├── package.json
└── README.md

## ✅ Что тестируется

### 🔵 Базовый уровень (CRUD)
- **products.list.spec.ts** — получение всех рандомных продуктов, сохранение в JSON
- **products.crud.spec.ts** — полный цикл: создание → чтение → обновление → удаление

### 🔵 Авторизация
- **auth.spec.ts** — регистрация → логин → получение токена → защищенный запрос

### 🔵 Негативные тесты
- **GET с несуществующим ID** — ожидаем 404
- **POST без авторизации** — ожидаем 401
- **POST с неверным Content-Type** — ожидаем 400
- **POST с невалидными данными** — ожидаем 422

### 🔵 Продвинутые тесты
- **products.schema.spec.ts** — проверка JSON Schema продукта
- **products.parametrized.spec.ts** — граничные значения цены (0, отрицательные, большие числа)

## ⚙️ Установка и запуск

### 1. Клонировать репозиторий
```bash
git clone <your-repo-url>
cd freeapi-tests

2.Установить зависимости
    npm install

3.Установить Allure (глобально, для отчетов)
    npm install -g allure-commandline
    
4. Запустить тесты
# Все тесты
    npm test

# Тесты с открытием Allure отчета
    npm run test:allure

# Только генерация Allure отчета (после тестов)
    npm run allure:report

📊 Команды в package.json
Команда	Описание
npm test	Запуск всех тестов
npm run test:headed	Запуск с открытым браузером (для UI)
npm run test:debug	Запуск в режиме отладки
npm run test:allure	Тесты + генерация + открытие Allure отчета
npm run allure:report	Генерация и открытие Allure отчета

📈 Отчетность
HTML-отчет Playwright: npx playwright show-report
Allure отчет: npm run allure:report (откроется автоматически)

🧪 Особенности реализации
✅ Один пользователь на все CRUD тесты (создается в beforeAll)
✅ Фикстура `authToken` для одиночных тестов (авторизация через `auth_context.ts`)
✅ Изоляция тестов через уникальные данные (faker)
✅ Параметризация для граничных значений
✅ JSON Schema валидация с ajv-formats
✅ Multipart запросы с загрузкой изображений

📝 Замеченные особенности API
Цена и stock принимаются как числа, но в multipart передаются строками
При получении продукта изображения возвращаются как объекты с url/localPath/_id
Для получения 400 нужно намеренно сломать заголовки (multipart + Content-Type: application/json)
