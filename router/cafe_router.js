const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const CafeInfo = require('../models/cafeInfo');
const { cafeSchema } = require('../schema');

// エラーハンドリング用ミドルウェア関数（cafeデータ用）
const validateCafe = (req, res, next) => {
    console.log(req.body); // リクエストボディの内容をログに出力
    // リクエストボディに対してスキーマで定義されたバリデートを適用する
    const { error } = cafeSchema.validate(req.body);
    if (error) {
        // detailsオブジェクトからmapでmessageを取得
        const msg = error.details.map(obj => obj.message).join('.');  // joinする事で配列をStringに変換
        throw new ExpressError(msg, 400); // 400はBad Requestのステータスコード
    } else {
        next(); // バリデーションが通ったら次のミドルウェアへ
    }
}


/** 一覧ページ */
router.get('/index', async (req, res) => {
    // カフェの一覧を全件選択
    const cafes = await CafeInfo.find({});
    res.render('../views/cafes/cafeindex', { cafes });
})

/** 詳細ページ */
router.get('/:id/detail', catchAsync(async (req, res) => { // catchAsyncでラップ
    // リクエストからidを取得
    const { id } = req.params;
    // クリックしたカフェのIDを元にデータを検索
    const cafe = await CafeInfo.findById(id).populate('reviews').exec(); // 追加
    if (!cafe) {
        req.flash('error', '指定されたカフェは存在しません。');
        return res.redirect('/cafe/index'); // カフェが存在しない場合は一覧ページにリダイレクト
    }
    // 詳細ページに遷移
    res.render('../views/cafes/cafedetail', { cafe });
}))

/** 登録ページへ遷移 */
router.get('/register', async (req, res) => {
    res.render('../views/cafes/caferegister');
})

/** 新規登録処理のルーティング */
router.post('/register', validateCafe, catchAsync(async (req, res) => { // catchAsyncでWrapする
    // 登録日用日付データを作成
    const date = new Date();
    // データ型をString型に変換
    const dateText = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    // リクエストボディのうちcafeデータを取得
    let cafeData = req.body.cafe;
    cafeData.registerDate = dateText;
    console.log(`リクエストボディの中身：${cafeData.shopName}`);
    // リクエストのデータを基にモデルをインスタンス化
    cafeData = new CafeInfo(cafeData);
    // データを登録する
    await cafeData.save();
    // フラッシュメッセージを設定
    req.flash('success', `${cafeData.shopName}のデータを登録しました。`);
    // 一覧画面にリダイレクト
    res.redirect("/cafe/index");
}))

/** 編集ページ */
router.get('/:id/edit', async (req, res) => {
    // リクエストからidを取得
    const { id } = req.params;
    // クリックしたカフェのIDを元にデータを検索
    const cafe = await CafeInfo.findById(id).exec();
    if (!cafe) {
        req.flash('error', '指定されたカフェは存在しません。');
        return res.redirect('/cafe/index'); // カフェが存在しない場合は一覧ページにリダイレクト
    }
    // カフェのデータを取得できた場合、編集ページに遷移
    res.render('../views/cafes/cafeedit', { cafe });
})

/** カフェ更新処理のルーティング */
router.put('/:id/edit', validateCafe, catchAsync(async (req, res) => {
    // リクエストからidを取得
    const { id } = req.params;
    // formデータを基にデータを更新（スプレッド構文を使って全てのプロパティを取得）
    const cafe = await CafeInfo.findByIdAndUpdate(id, { ...req.body.cafe }, { new: true });
    // 削除したデータをログで表示
    console.log(`${cafe.shopName}のデータを更新しました。`);
    // フラッシュメッセージを設定
    req.flash('success', `${cafe.shopName}のデータを更新しました。`);
    // 詳細画面にリダイレクト
    res.redirect(`/cafe/${cafe.id}/edit`);
}))

/** カフェの削除処理のルーティング */
router.delete('/:id/delete', async (req, res) => {
    // リクエストからidを取得
    const { id } = req.params;
    // idをキーにプロダクトを検索して削除する
    const cafe = await CafeInfo.findByIdAndDelete(id);
    // 削除したデータをログで表示
    console.log(`${cafe.shopName}データを削除しました。`);
    // フラッシュメッセージを設定
    req.flash('success', `${cafe.shopName}のデータを削除しました。`);
    // 一覧画面にリダイレクト
    res.redirect("/cafe/index");
})



module.exports = router;