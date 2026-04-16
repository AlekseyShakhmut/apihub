# API тесты для FreeAPI (E-commerce)

## Описание проекта
Проект содержит автоматизированные API-тесты для [FreeAPI](https://freeapi.hashnode.space/api-guide). 
Тесты покрывают CRUD операции с продуктами, авторизацию, негативные сценарии и продвинутую валидацию.

## Технологии
- **Playwright** - фреймворк для тестирования
- **TypeScript** - язык разработки
- **Faker.js** - генерация тестовых данных
- **Ajv** - валидация JSON Schema
- **Allure** - отчетность

## Установка зависимостей

# Основные пакеты
npm install --save-dev @playwright/test @faker-js/faker

# Переменные окружения
npm install --save-dev dotenv @types/dotenv

# JSON Schema валидация
npm install --save-dev ajv ajv-formats

# Отчеты
npm install --save-dev allure-playwright


## Структура проекта
```
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
│ ├── random_products/
│ │ ├── products.list_read.spec.ts
│ │ └── products.list_write.spec.ts
│ └── cart/
│ ├── cart.crud.spec.ts
│ ├── cart.negative.spec.ts
│ └── cart.schema.spec.ts
├── utils/
│ ├── data_generator.ts
│ ├── form_data_helper.ts
│ ├── image_helper.ts
│ ├── schemas.ts
│ ├── setup_product.ts
│ ├── delete_product.ts
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

```
## Что тестируется

### Базовый уровень (CRUD)
- **products.crud.spec.ts** - полный цикл: создание → чтение → обновление → удаление

### Получение данных
- **products.list.spec.ts** - получение списка рандомных продуктов из публичного API, сохранение в JSON

### Работа с категориями
- **products.category.spec.ts** - получение продуктов по категории (связь категория → продукты)

### Изображения
- **products.image.spec.ts** - удаление дополнительных изображений у продукта

### Валидация
- **products.schema.spec.ts** - проверка JSON Schema для POST, GET, PATCH, DELETE
- **products.parametrized.spec.ts** - граничные значения цены (0, отрицательные, большие числа)

### Авторизация и регистрация
- **auth.spec.ts** - регистрация → логин → получение токена → защищенный запрос
- **auth.negative.spec.ts** - негативные тесты авторизации
- **registration.negative.spec.ts** - негативные тесты регистрации (email, username, роль)

### Негативные тесты продуктов
- **products.negative.spec.ts** - комплекс негативных сценариев:
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

### Корзина
- **cart.crud.spec.ts** - полный цикл работы с корзиной:
  - добавление первого продукта
  - добавление второго продукта
  - проверка содержимого корзины
  - удаление одного продукта из корзины
  - полная очистка корзины
- **cart.negative.spec.ts** - негативные сценарии корзины:
  - добавление невалидного количества (0, отрицательное, превышающее остаток)
  - запросы без авторизации (401) для POST, DELETE, GET
  - удаление несуществующего продукта из корзины (404)
  - удаление с невалидным ID (422)
- **cart.schema.spec.ts** - проверка JSON Schema для POST и GET

## Хелперы

**data_generator.ts** - генерация тестовых данных (продукты, количество, цены)

**form_data_helper.ts** - построитель FormData для multipart запросов

**image_helper.ts** - работа с изображениями (конвертация в Blob)

**schemas.ts** - JSON Schema для валидации ответов API

**setup_product.ts** - создание категорий и продуктов для тестов

**delete_product.ts** - удаление продуктов и категорий после тестов

**user_helper.ts** - генерация данных пользователя

**types.ts** - TypeScript интерфейсы (SubImage, Product)

## Установка и запуск

### 1. Клонировать репозиторий
```bash
git clone <https://github.com/AlekseyShakhmut/apihub.git>
cd apihub
```

### 2. Установить зависимости
```bash
npm install
```

### 3. Настроить окружение
```bash
cp .env.example .env
```
- Заполнить `.env` своими данными.
- `API_BASE_URL` берется из `.env` (если не задан, используется дефолт из `playwright.config.ts`).

### 4. Установить Allure CLI (для локального просмотра отчетов)
```bash
npm install -g allure-commandline
```

### 5. Запуск тестов
```bash
# Все тесты
npm test

# С открытым браузером
npm run test:headed

# Debug режим
npm run test:debug

# Тесты + генерация и открытие Allure отчета
npm run test:allure

# Генерация и открытие Allure отчета (после прогона)
npm run allure:report
```

### Запуск конкретного теста + отчет
```bash
# 1) Очистить старые результаты
rm -rf allure-results

# 2) Запустить конкретный spec
npx playwright test api-tests/tests/products/products.parametrized.spec.ts

# 3) Построить и открыть Allure отчет
npm run allure:report
```

### Команды из `package.json`
- `npm test` - запуск всех тестов
- `npm run test:headed` - запуск с открытым браузером
- `npm run test:debug` - запуск в режиме отладки
- `npm run test:allure` - тесты + генерация + открытие Allure отчета
- `npm run allure:report` - генерация и открытие Allure отчета

Отчетность
HTML-отчет Playwright: npx playwright show-report
Allure отчет: npm run allure:report (откроется автоматически)

Примечание: `allure-results/` и `allure-report/` являются артефактами запуска и не должны коммититься в репозиторий.

Особенности реализации
- Один пользователь на все CRUD тесты (создается в `beforeAll`)
- Очистка данных после тестов (удаление продуктов и категорий в `afterAll`)
- Фикстура `authToken` для одиночных тестов (авторизация через `auth_context.ts`)
- Изоляция тестов через уникальные данные (faker)
- Параметризация для граничных значений
- JSON Schema валидация с ajv-formats
- Multipart запросы с загрузкой изображений
- Повторяющаяся логика вынесена в `setup_product.ts` (создание категории + продукта)

Замеченные особенности API
- Цена и stock - принимаются как числа, но в multipart передаются строками
- Изображения - при получении продукта возвращаются как объекты с полями `url`, `localPath`, `_id`
- 400 Bad Request - можно получить, намеренно сломав заголовки (multipart + `Content-Type: application/json`)
- Цена - может быть 0 и отрицательной (API принимает как валидные значения)
- Переполнение - при очень больших числах (более 1e+23) возникает ошибка 422
- Удаление продукта - возвращает полный объект удаленного продукта (200 OK)
- Удаление категории - возвращает полный объект удаленной категории (200 OK)
