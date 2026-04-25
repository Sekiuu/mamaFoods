import { v2 as cloudinary } from 'cloudinary'

const config = useRuntimeConfig()

if (!config.public.cloudinary.cloudName) throw new Error('Missing cloudinary.cloudName')
if (!config.cloudinary.apiKey) throw new Error('Missing cloudinary.apiKey')
if (!config.cloudinary.apiSecret) throw new Error('Missing cloudinary.apiSecret')

cloudinary.config({
    cloud_name: config.public.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true
})
export default cloudinary