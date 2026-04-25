import { google } from 'googleapis'

export function useGoogleDrive() {
    // auth google drive api
    // ดึง JSON String จาก Env และแปลงกลับเป็น Object
    const config = useRuntimeConfig()
    const serviceAccount = JSON.parse(config.googleServiceAccountJson)
    if(!serviceAccount) throw new Error('Missing googleServiceAccountJson')
    const auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: ['https://www.googleapis.com/auth/drive']
    })

    const drive = google.drive({ version: 'v3', auth: auth })
    return drive
}