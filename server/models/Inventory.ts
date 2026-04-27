import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true }, // e.g., Liters, Kg, Pieces
  min_stock: { type: Number, default: 5 },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('Inventory', InventorySchema);
