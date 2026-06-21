const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb://janazaapp1_db_user:admin123@ac-cvb7rga-shard-00-00.a5sc0rp.mongodb.net:27017,ac-cvb7rga-shard-00-01.a5sc0rp.mongodb.net:27017,ac-cvb7rga-shard-00-02.a5sc0rp.mongodb.net:27017/?ssl=true&replicaSet=atlas-z02w5e-shard-0&authSource=admin&appName=Cluster11';

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('users');

    const existingUser = await collection.findOne({ email: 'example@gmail.com' });
    if (existingUser) {
      console.log('Test user example@gmail.com already exists.');
    } else {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const newUser = {
        name: 'Test User',
        email: 'example@gmail.com',
        password: hashedPassword,
        role: 'customer',
        addresses: [],
        wishlist: [],
        loyaltyPoints: 0,
        isVerified: true,
        isActive: true,
        authProvider: 'local',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const res = await collection.insertOne(newUser);
      console.log('Test user created successfully:', res.insertedId);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main();
