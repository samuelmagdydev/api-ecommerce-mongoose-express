const mongoose = require('mongoose');


const couponSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: [true, 'Cupon name is required'],
        unique: true,
    },
    expire:{
        type: Date,
        required: [true, 'Cupon expiration date is required'],
    },
    discount:{
        type: Number,
        required: [true, 'Cupon discount value is required'],
    },
},{timestamps :true});

module.exports = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
