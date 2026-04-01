// ========== PRODUCTS ==========
export const productSchema = {
    type: 'object',
    required: ['_id', 'name', 'price', 'stock', 'category', 'mainImage', 'subImages'],
    properties: {
        // Основные бизнес-поля
        _id: { type: 'string' },
        name: { type: 'string' },
        price: { type: 'number' },
        stock: { type: 'number' },
        category: { type: 'string' },
        description: { type: 'string' },  // опционально

        // Изображения
        mainImage: {
            type: 'object',
            required: ['url'],
            properties: {
                url: { type: 'string' }
                // localPath и _id — технические, не проверяем
            }
        },
        subImages: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    url: { type: 'string' }
                    // localPath и _id — технические, не проверяем
                }
            }
        }
    }
};

export const categoryProductsSchema = {
    type: 'object',
    required: ['statusCode', 'data', 'message', 'success'],
    properties: {
        statusCode: { type: 'number' },
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
            type: 'object',
            required: ['products', 'totalProducts', 'limit', 'page', 'totalPages', 'category'],
            properties: {
                // Пагинация (бизнес-поля)
                totalProducts: { type: 'number' },
                limit: { type: 'number' },
                page: { type: 'number' },
                totalPages: { type: 'number' },
                serialNumberStartFrom: { type: 'number' },
                hasPrevPage: { type: 'boolean' },
                hasNextPage: { type: 'boolean' },
                prevPage: { type: ['number', 'null'] },
                nextPage: { type: ['number', 'null'] },

                // Категория (бизнес-данные)
                category: {
                    type: 'object',
                    required: ['_id', 'name'],
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' }
                    }
                },

                // Список продуктов
                products: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['_id', 'name', 'price', 'category'],
                        properties: {
                            _id: { type: 'string' },
                            name: { type: 'string' },
                            price: { type: 'number' },
                            category: { type: 'string' },
                            description: { type: 'string' },
                            stock: { type: 'number' },
                            mainImage: {
                                type: 'object',
                                properties: {
                                    url: { type: 'string' },
                                    localPath: { type: 'string' },
                                    _id: { type: 'string' }
                                }
                            },
                            subImages: { type: 'array' }
                        }
                    }
                }
            }
        }
    }
};

export const deleteProductResponseSchema = {
    type: 'object',
    required: ['statusCode', 'data', 'message', 'success'],
    properties: {
        statusCode: { type: 'number' },
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
            type: 'object',
            required: ['deletedProduct'],
            properties: {
                deletedProduct: {
                    type: 'object',
                    required: ['_id', 'name', 'price', 'category'],
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        category: { type: 'string' },
                        description: { type: 'string' },
                        stock: { type: 'number' },
                        mainImage: { type: 'object' },
                        subImages: { type: 'array' }
                    }
                }
            }
        }
    }
};

export const removeSubImageResponseSchema = {
    type: 'object',
    required: ['statusCode', 'data', 'message', 'success'],
    properties: {
        statusCode: { type: 'number' },
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
            type: 'object',
            required: ['_id', 'name', 'price', 'category', 'subImages'],
            properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                category: { type: 'string' },
                description: { type: 'string' },
                stock: { type: 'number' },
                owner: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                mainImage: {
                    type: 'object',
                    properties: {
                        url: { type: 'string' },
                        localPath: { type: 'string' },
                        _id: { type: 'string' }
                    }
                },
                subImages: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['url', 'localPath', '_id'],
                        properties: {
                            url: { type: 'string' },
                            localPath: { type: 'string' },
                            _id: { type: 'string' }
                        }
                    }
                }
            }
        }
    }
};

// ========== AUTH ==========
export const registerResponseSchema = {
    type: 'object',
    required: ['_id', 'username', 'email', 'role'],
    properties: {
        _id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    }
};

export const loginResponseSchema = {
    type: 'object',
    required: ['accessToken', 'refreshToken'],
    properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' }
    }
};

export const userSchema = {
    type: 'object',
    required: ['_id', 'email', 'username', 'role'],
    properties: {
        _id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        role: { type: 'string' }
    }
};

// ========== CART ==========
export const cartSchema = {
    type: 'object',
    required: ['_id', 'items', 'cartTotal'],
    properties: {
        _id: { type: 'string' },
        items: {
            type: 'array',
            items: {
                type: 'object',
                required: ['_id', 'product', 'quantity'],
                properties: {
                    _id: { type: 'string' },
                    coupon: { type: ['object', 'null'] },
                    quantity: { type: 'number' },
                    product: {
                        type: 'object',
                        required: ['_id', 'name', 'price'],
                        properties: {
                            _id: { type: 'string' },
                            name: { type: 'string' },
                            price: { type: 'number' },
                            category: { type: 'string' }
                        }
                    }
                }
            }
        },
        cartTotal: { type: 'number' },
        discountedTotal: { type: 'number' }
    }
};