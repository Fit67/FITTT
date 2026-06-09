import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables')

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== 'production',
    })
    console.log(`✅  MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err)
    process.exit(1)
  }

  mongoose.connection.on('error', (err: Error) => console.error('MongoDB error:', err))
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'))
}
