# API тесты для FreeAPI (E-commerce)

## Описание проекта
Проект содержит автоматизированные API-тесты для [FreeAPI](https://freeapi.hashnode.space/api-guide). 
Тесты покрывают CRUD операции с продуктами, авторизацию, негативные сценарии и продвинутую валидацию.

## Технологии
- **Playwright** — фреймворк для тестирования
- **TypeScript** — язык разработки
- **Faker.js** — генерация тестовых данных
- **Ajv** — валидация JSON Schema
- **Allure** — отчетность

## Структура проекта

api-tests/
├── fixtures/
│ └── auth_context.ts
├── tests/
│ ├── products/
│ │ ├── products.crud.spec.ts
│ │ ├── products.list.spec.ts
│ │ ├── products.negative.spec.ts
│ │ ├── products.schema.spec.ts
│ │ ├── products.parametrized.spec.ts
│ │ ├── products.category.spec.ts
│ │ └── products.image.spec.ts
│ ├── auth/
│ │ ├── auth.spec.ts
│ │ ├── auth.negative.spec.ts
│ │ └── registration.negative.spec.ts
│ └── random_products/
│ ├── products.list_read.spec.ts
│ └── products.list_write.spec.ts
├── utils/
│ ├── data_generator.ts
│ ├── form_data_helper.ts
│ ├── image_helper.ts
│ ├── schemas.ts
│ ├── setup.ts
│ ├── types.ts
│ └── user_helper.ts
├── test-data/
│ ├── main.jpg
│ ├── sub1.jpeg
│ ├── sub2.jpg
│ └── sub3.jpg
├── data/
│ └── products_initial.json
├── playwright.config.ts
├── package.json
└── README.md

## Что тестируется

### Базовый уровень (CRUD)
- **products.crud.spec.ts** — полный цикл: создание → чтение → обновление → удаление

### Получение данных
- **products.list.spec.ts** — получение списка рандомных продуктов из публичного API, сохранение в JSON

### Работа с категориями
- **products.category.spec.ts** — получение продуктов по категории (связь категория → продукты)

### Изображения
- **products.image.spec.ts** — удаление дополнительных изображений у продукта

### Валидация
- **products.schema.spec.ts** — проверка JSON Schema для POST, GET, PATCH, DELETE
- **products.parametrized.spec.ts** — граничные значения цены (0, отрицательные, большие числа)

### Авторизация и регистрация
- **auth.spec.ts** — регистрация → логин → получение токена → защищенный запрос
- **auth.negative.spec.ts** — негативные тесты авторизации
- **registration.negative.spec.ts** — негативные тесты регистрации (email, username, роль)

### Негативные тесты продуктов
- **products.negative.spec.ts** — комплекс негативных сценариев:
    - POST /products без авторизации (401)
    - POST /products с неверным Content-Type (400)
    - POST /products с пустыми полями (422)
    - POST /products с неверным типом данных price (422)
    - GET /products/{id} с несуществующим ID (404)
    - GET /products/{id} с невалидным ID (422)
    - PATCH /products/{id} без авторизации (401)
    - PATCH /products/{id} с несуществующим ID (404)
    - PATCH /products/{id} с невалидным ID (422)
    - PATCH /products/{id} с неверным типом price (422)
    - DELETE /products/{id} без авторизации (401)
    - DELETE /products/{id} с несуществующим ID (404)
    - DELETE /products/{id} с невалидным ID (422)

## Установка и запуск

### 1. Клонировать репозиторий
```bash
git clone <https://github.com/AlekseyShakhmut/apihub.git>
cd apihub

2.Установить зависимости
    npm install
3. Скопировать `.env.example` в `.env`:
    ```bash
    cp .env.example .env
4. Заполнить .env своими данными
5.Установить Allure (глобально, для отчетов)
    npm install -g allure-commandline
6. Запустить тесты

# Все тесты
    npm test
# Тесты с открытием Allure отчета
    npm run test:allure

# Только генерация Allure отчета (после тестов)
    npm run allure:report
    
Чтобы открыть отчет только по конкретному тесту:
# 1. Очистить старые результаты
rm -rf allure-results

# 2. Запустить конкретный тест
npx playwright test api-tests/tests/advanced/products.parametrized.spec.ts

# 3. Открыть отчет (теперь только по этому тесту)
npm run allure:report

Команды в package.json
Команда	Описание
npm test	Запуск всех тестов
npm run test:headed	Запуск с открытым браузером (для UI)
npm run test:debug	Запуск в режиме отладки
npm run test:allure	Тесты + генерация + открытие Allure отчета
npm run allure:report	Генерация и открытие Allure отчета

Отчетность
HTML-отчет Playwright: npx playwright show-report
Allure отчет: npm run allure:report (откроется автоматически)

Особенности реализации
- Один пользователь на все CRUD тесты (создается в `beforeAll`)
- Очистка данных после тестов (удаление продуктов и категорий в `afterAll`)
- Фикстура `authToken` для одиночных тестов (авторизация через `auth_context.ts`)
- Изоляция тестов через уникальные данные (faker)
- Параметризация для граничных значений
- JSON Schema валидация с ajv-formats
- Multipart запросы с загрузкой изображений
- Повторяющаяся логика вынесена в `setup.ts` (создание категории + продукта)

Замеченные особенности API
- Цена и stock — принимаются как числа, но в multipart передаются строками
- Изображения — при получении продукта возвращаются как объекты с полями `url`, `localPath`, `_id`
- 400 Bad Request — можно получить, намеренно сломав заголовки (multipart + `Content-Type: application/json`)
- Цена — может быть 0 и отрицательной (API принимает как валидные значения)
- Переполнение — при очень больших числах (более 1e+23) возникает ошибка 422
- Удаление продукта — возвращает полный объект удаленного продукта (200 OK)
- Удаление категории — возвращает полный объект удаленной категории (200 OK)
