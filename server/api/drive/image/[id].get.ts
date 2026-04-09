import { google } from 'googleapis'
import path from 'path'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  const fileId = getRouterParam(event, 'id')
  const config = useRuntimeConfig(event)

// ดึง JSON String จาก Env และแปลงกลับเป็น Object
  const serviceAccount = JSON.parse(config.googleServiceAccountJson)
const auth = new google.auth.GoogleAuth({
    // เปลี่ยนจาก keyFile เป็น credentials
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n'), // สำคัญ: จัดการเรื่องขึ้นบรรทัดใหม่
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })

  const drive = google.drive({ version: 'v3', auth })
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
    const contentType = fileMetadata.data.mimeType || 'image/jpeg'

    setResponseHeader(event, 'Content-Type', contentType)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

    return sendStream(event, response.data)

  } catch (error: any) {
    console.error('❌ Google Drive Error:', error.message)
    throw createError({
      statusCode: 404,
      statusMessage: 'Image not found or Permission denied'
    })
  }
})