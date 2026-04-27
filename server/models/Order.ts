import mongoose, { Schema, Document } from 'mongoose';

export interface ILaundryOrder extends Document {
  receipt_number: string;
  customer_name: string;
  phone_number?: string;
  laundry_details?: string;
  date_received: Date;
  estimated_completion: Date;
  status: 'washing' | 'drying' | 'ironing' | 'completed';
  created_at: Date;
  updated_at: Date;
}

const LaundryOrderSchema: Schema = new Schema({
  receipt_number: { type: String, required: true, unique: true },
  customer_name: { type: String, required: true },
  phone_number: { type: String },
  laundry_details: { type: String },
  laundry_type: { type: String },
  weight: { type: Number },
  date_received: { type: Date, default: Date.now },
  estimated_completion: { type: Date },
  status: { 
    type: String, 
    enum: ['washing', 'drying', 'ironing', 'completed'],
    default: 'washing'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model<ILaundryOrder>('Order', LaundryOrderSchema);
