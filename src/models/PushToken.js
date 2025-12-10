import mongoose from 'mongoose';

const pushTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        index: true // <--- One index definition
    },
    token: { type: String, required: true }
});

const PushToken = mongoose.models.PushToken || mongoose.model('PushToken', pushTokenSchema);

export default PushToken;