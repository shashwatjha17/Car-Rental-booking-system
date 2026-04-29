import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({
    car: {type: ObjectId, ref: "Car", required: true},
    user: {type: ObjectId, ref: "User", required: true},
    owner: {type: ObjectId, ref: "User", required: true},
    pickupDate: {type: Date, required: true},
    returnDate: {type: Date, required: true},
    status: {type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending"},
    price: {type: Number, required: true},
    messages: [{
        sender: {type: ObjectId, ref: "User", required: true},
        senderRole: {type: String, enum: ["owner", "user"], required: true},
        text: {type: String, required: true, trim: true},
        createdAt: {type: Date, default: Date.now}
    }]
},{timestamps: true})

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking