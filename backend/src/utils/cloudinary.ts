import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import fs from 'fs/promises'
import path from 'path'
import streamifier from 'streamifier'

function hasRealValue(value: string | undefined, placeholders: string[]) {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return Boolean(normalized) && !placeholders.includes(normalized) && !normalized.includes('your_')
}

export const cloudinaryConfigured = Boolean(
  hasRealValue(process.env.CLOUDINARY_CLOUD_NAME, ['cloud_name', 'placeholder']) &&
  hasRealValue(process.env.CLOUDINARY_API_KEY, ['api_key', 'placeholder']) &&
  hasRealValue(process.env.CLOUDINARY_API_SECRET, ['api_secret', 'placeholder'])
)

const requireCloudinary = process.env.NODE_ENV === 'production' || process.env.CLOUDINARY_REQUIRED === 'true'

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

if (requireCloudinary && !cloudinaryConfigured) {
  throw new Error(
    'Cloudinary is required in production. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
  )
}

function extensionForMime(mimeType?: string) {
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  if (mimeType === 'image/gif') return 'gif'
  if (mimeType === 'image/svg+xml') return 'svg'
  return 'jpg'
}

async function saveImageLocally(buffer: Buffer, folder: string, mimeType?: string): Promise<UploadApiResponse> {
  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\/+/, '') || 'uploads'
  const uploadsDir = path.resolve(process.cwd(), 'uploads', safeFolder)
  await fs.mkdir(uploadsDir, { recursive: true })

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extensionForMime(mimeType)}`
  const filePath = path.join(uploadsDir, filename)
  await fs.writeFile(filePath, buffer)

  const baseUrl = process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 5000}`
  const secureUrl = `${baseUrl.replace(/\/$/, '')}/uploads/${safeFolder}/${filename}`

  return {
    secure_url: secureUrl,
    url:        secureUrl,
    public_id:  `${safeFolder}/${filename}`,
  } as UploadApiResponse
}

export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string = 'products',
  mimeType?: string,
): Promise<UploadApiResponse> {
  if (!cloudinaryConfigured) return saveImageLocally(buffer, folder, mimeType)

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error)
        if (result) return resolve(result)
        reject(new Error('Image upload failed'))
      }
    )
    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}
