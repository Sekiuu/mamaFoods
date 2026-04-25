import path from 'path'
import fs from 'fs'
import { useGoogleDrive } from '~~/server/utils/drive'

const drive = useGoogleDrive()
export default defineEventHandler(async (event) => {
  const fileId = getRouterParam(event, 'id')
  try {
    // 1. ลองดึงข้อมูลไฟล์ก่อนเพื่อดูว่ามีตัวตนและดึง Metadata ได้ไหม
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType, name'
    })

    // 2. ดึงข้อมูล Binary (Media)
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    )

    // 3. ป้องกัน Error "undefined" ด้วยการใส่ค่า Default หรือใช้จาก Metadata
    // set Content-Type (ect. image/jpeg, image/png)
    const contentType = fileMetadata.data.mimeType || 'image/jpeg'
    // set content-type to response
    setResponseHeader(event, 'Content-Type', contentType)
    // set Cache-Control (Cace imgae for 1 hour)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
    // sent as stream( file stream )
    return sendStream(event, response.data)

  } catch (error: any) {
    console.error('❌ Google Drive Error:', error.message)
    throw createError({
      statusCode: 404,
      statusMessage: 'Image not found or Permission denied'
    })
  }
})