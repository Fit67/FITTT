import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import streamifier from 'streamifier'

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
