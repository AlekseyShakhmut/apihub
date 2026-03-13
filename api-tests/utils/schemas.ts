export const productSchema = {
    type: 'object',
    required: ['_id', 'name', 'price', 'category', 'createdAt'],
    properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        price: { type: 'number' },
        description: { type: 'string' },
        category: { type: 'string' },
        owner: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        __v: { type: 'number' },
        stock: { type: 'number' },
        mainImage: {
            type: 'object',
            required: ['url', 'localPath', '_id'],
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
};