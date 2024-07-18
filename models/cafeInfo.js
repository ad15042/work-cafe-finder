/** カフェの基本情報のモデル 
 * shopName: 店の名前
 * priceOfcoffee: コーヒー一杯の価格
 * location: カフェの住所
 * hasWiFi: WiFiの有無
 * wifiStrength: WiFiの強度
 * comfort: 快適さ
 * comment: コメント
 * registerDate: 登録日
*/

const mongoose = require('mongoose');

const CafeInfoSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: true,
    },
    priceOfcoffee: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        type: String,
        required: true,
    },
    hasWiFi: {
        type: Boolean,
        required: true,
    },
    wifiStrength: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 50,
    },
    comfort: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
        default: 5,
    },
    comment: {
        type: String,
    },
    registerDate: {
        type: String,

    },
    image: {
        type: String,
    },
})

// モデル作成
const CafeInfo = mongoose.model('CafeInfo', CafeInfoSchema);
// エクスポート
module.exports = CafeInfo;

