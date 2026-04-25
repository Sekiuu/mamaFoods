import { readMultipartFormData } from 'h3';
import { v2 as cloudinary } from 'cloudinary';

export default defineEventHandler(async (event) => {

    // อ่านไฟล์จาก Request
    const formData = await readMultipartFormData(event);
    const file = formData?.find((item) => item.name === 'file');

    if (!file) {
        throw createError({ statusCode: 400, statusMessage: 'No file found' });
    }

    const config = useRuntimeConfig(event);

    // Configure Cloudinary using environment variables
    cloudinary.config({
        cloud_name: config.public.cloudinary.cloudName,
        api_key: config.cloudinary.apiKey,
        api_secret: config.cloudinary.apiSecret,
    });

    try {
        // Convert the file buffer to a Base64 Data URI for the upload
        const base64Data = Buffer.from(file.data).toString('base64');
        const fileUri = `data:${file.type};base64,${base64Data}`;

        const response = await cloudinary.uploader.upload(fileUri, {
            folder: 'mama-food-uploads', // Specify your folder name
        });

        return {
            url: response.secure_url,
            public_id: response.public_id,
        };

    } catch (error: any) {
        console.error('Cloudinary Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Cloudinary Upload Failed',
        });
    }
});
