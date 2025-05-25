// joi
const Joi = require('joi');

// cafeスキーマを定義
module.exports.cafeSchema = Joi.object({
    cafe: Joi.object({ // リクエストボディにcafeDataがあることを定義
        //　cafeDataの中身がどういう値かをobjectの中に定義する
        shopName: Joi.string().required(), // String&必須項目
        priceOfcoffee: Joi.number().min(0).required(), // 数値型&必須項目&最小値は0
        location: Joi.string().required(), // String&必須項目
        hasWiFi: Joi.boolean().required(), // Boolean&必須項目
        wifiStrength: Joi.number().min(0).max(100).required(), // 数値&必須項目&最小値０&最大値100
        confort: Joi.number().min(0).max(10).required(), // 数値&必須項目&最小値０&最大値10
        comment: Joi.string(), // String
        registerDate: Joi.string(), // String
        image: Joi.string().allow(''), // String
    }).required() // リクエストボディのcafeDataは必須項目であることを定義
});


// reviewスキーマを定義
// リクエストは以下のようなデータ形式で送信される
// review:[
//     body:String,
//     rating:Number
// ]
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required(),
        rating: Joi.number().required()
    }).required()
});



