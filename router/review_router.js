const express = require('express');
const router = express.Router();
const { reviewSchema } = require('../schema');  // reviewSchemaはJoiで定義されたバリデーションスキーマ
const ExpressError = require('../utils/ExpressError');  // ExpressErrorはカスタムエラーハンドリング用
const catchAsync = require('../utils/catchAsync');  // catchAsyncは非同期処理のエラーハンドリング用
const CafeInfo = require('../models/cafeInfo');  // CafeInfoはカフェ情報のモデル
const Review = require('../models/review');
const validateReview = (req, res, next) => {
    // リクエストボディに対してスキーマで定義されたバリデートを適用する
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        // detailsオブジェクトからmapでmessageを取得
        const msg = error.details.map(obj => obj.message).join('.');  // joinする事で配列をStringに変換
        throw new ExpressError(msg, 400); // 400はBad Requestのステータスコード
    } else {
        next(); // バリデーションが通ったら次のミドルウェアへ
    }
}

/** レビュー登録処理のルーティング */
router.post('/:id/reviews', validateReview, catchAsync(async (req, res) => {
    // レビュー対象のカフェ取得
    const cafe = await CafeInfo.findById(req.params.id);
    //　登録するレビューをもとにモデルのインスタンス生成
    const review = new Review(req.body.review);
    // レビューをカフェにpush
    cafe.reviews.push(review);
    //　各モデルの登録処理
    await cafe.save();
    await review.save();
    // カフェの詳細ページにリダイレクト
    res.redirect(`/cafe/${cafe._id}/detail`)
}))

/** レビューの削除処理のルーティング */
router.delete('/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // レビューの削除
    await Review.findByIdAndDelete(reviewId);
    // カフェのreviews配列から該当のレビューIDを削除
    await CafeInfo.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }) // カフェモデルを削除するわけではないからアップデートになる
    // 削除後、カフェの詳細ページにリダイレクト
    res.redirect(`/cafe/${id}/detail`)
}))

module.exports = router;