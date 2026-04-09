export const useDriveImage = () => {
    const config = useRuntimeConfig()
    const getDriveFileId = (url: string): string => {
        // Regex นี้จะรองรับทั้งแบบ /file/d/ID/view และแบบ ?id=ID
        const regex = /\/file\/d\/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);

        if (match) {
            return match[1] || match[2] || "none"; // คืนค่า ID ที่เจอ
        }

        return url; // ถ้าไม่เจอรูปแบบที่ต้องการ ให้คืนค่าเดิมกลับไป (เผื่อ Admin ใส่ ID มาตรงๆ)
    }
    const getImageURL = (url: string): string => {
        if(!url.includes('drive.google.com')) return url;
        const driveFileId = getDriveFileId(url);
        return  `/api/drive/image/${driveFileId}`;
    }
    return { getImageURL , getDriveFileId }

}