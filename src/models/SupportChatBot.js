// models/SupportChatBot.js
import mongoose from 'mongoose';

const SupportChatBotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  issue: {
    type: String,
    required: true,
  },

},{timestamps: true});

export default mongoose.models.SupportChatBot || mongoose.model('SupportChatBot', SupportChatBotSchema);
