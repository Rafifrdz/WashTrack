import admin from 'firebase-admin';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../server/models/Order.js'; // Added .js extension for ESM
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase Admin Setup
const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
let serviceAccount;

try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('Error: serviceAccountKey.json not found or invalid.');
  console.log('Please download your service account key from Firebase Console and save it as serviceAccountKey.json in the root folder.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

// MongoDB Setup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/washtrack';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Fetching orders from Firestore...');
    const snapshot = await firestore.collection('orders').get();
    
    if (snapshot.empty) {
      console.log('No orders found in Firestore.');
      return;
    }

    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        receipt_number: data.receipt_number,
        customer_name: data.customer_name,
        phone_number: data.phone_number,
        laundry_details: data.laundry_details,
        status: data.status,
        // Convert Firestore Timestamps to JS Dates
        date_received: data.date_received?.toDate() || new Date(),
        estimated_completion: data.estimated_completion?.toDate() || new Date(),
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
      };
    });

    console.log(`Migrating ${orders.length} orders...`);

    for (const order of orders) {
      await Order.findOneAndUpdate(
        { receipt_number: order.receipt_number },
        order,
        { upsert: true, new: true }
      );
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

migrate();
