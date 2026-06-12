import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import streamifier from 'streamifier'

// Explicitly configure so it can read individual env vars or CLOUDINARY_URL
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function uploadImageBuffer(buffer: Buffer, folder: string = 'products'): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error)
        if (result) resolve(result)
      }
    )
    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}
