import fs from 'fs';
import path from 'path';

export function createImageBlob(fileName: string) {
    const imagePath = path.join(process.cwd(), 'api-tests/test-data', fileName);
    const imageBuffer = fs.readFileSync(imagePath);
    return new Blob([imageBuffer], {
        type: `image/${fileName.split('.').pop()}`
    });
}