import { readMultipartFormData } from 'h3';
import cloudinary from '~~/server/utils/cloudinary';
const config = useRuntimeConfig()
export default defineEventHandler(async (event) => {

    // อ่านไฟล์จาก Request
    const formData = await readMultipartFormData(event);
    const file = formData?.find((item) => item.name === 'file');

    if (!file) {
        throw createError({ statusCode: 400, statusMessage: 'No file found' });
    }

    try {
        // Convert the file buffer to a Base64 Data URI for the upload
        const base64Data = Buffer.from(file.data).toString('base64');
        const dataURI = `data:${file.type};base64,${base64Data}`;

        // Upload to Cloudinary
        const response = await cloudinary.uploader.upload(
            dataURI,
            {
                folder: config.cloudinary.folder.foods,
                resource_type: 'image',
                public_id: file.filename,
                filename_override: file.filename,
            }
        );

        if (!response.secure_url || !response.public_id) {
            throw createError({ statusCode: 500, statusMessage: 'Cloudinary Upload Failed' });
        }

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