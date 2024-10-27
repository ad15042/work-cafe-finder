const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    body: String, // レビューの中身
    rating: Number, // 評価
});

module.exports = mongoose.model('Review', reviewSchema);