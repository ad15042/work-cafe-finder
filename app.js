// 各種ライブラリのインポート
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
// CafeInfoモデル
const CafeInfo = require('./models/cafeInfo');
// methodOverride
var methodOverride = require('method-override');
// morgan
var morgan = require('morgan')
// ejs-mate
const ejsMate = require('ejs-mate');
// 非同期関数エラー捕捉共通処理
const catchAsync = require('./utils/catchAsync');
// 独自のエラークラス
const ExpressError = require('./utils/ExpressError');
// Joiで定義したスキーマ
const { cafeSchema } = require('./schema');

/// MongoDBへの接続
// エラー処理
main().catch(err => console.log(err, 'Mongo DBへの接続失敗'));

async function main() {
    // 以下のURIはmongoDBのサーバだけではなく、DBの場所(今回だとfarmStand)も指している。
    await mongoose.connect('mongodb://127.0.0.1:27017/work-cafe');
    console.log('Mongo DBへの接続成功')

    // もしデータベースに認証が必要な場合は、ユーザー名とパスワードを含めて接続します

    // await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test
}

// formデータをパースする
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
// POSTメソッドをPATCHメソッドでオーバーライドする
app.use(methodOverride('_method')) // _methodは何でも良いが、formのactionで渡すクエリストリングと同じにすること。

// デフォルトEJSではなく、EJS-MATEのテンプレートを使うようにエンジンに設定
app.engine('ejs', ejsMate);
// ejsのディレクトリの設定
app.set('views', path.join(__dirname, 'views'));
// ejsをview エンジンに設定
app.set('view engine', 'ejs');
// モルガンを設定
app.use(morgan('tiny'));

// エラーハンドリング用ミドルウェア関数
const validateCafe = (req, res, next) => {
    // リクエストボディに対してスキーマで定義されたバリデートを適用する
    const { error } = cafeSchema.validate(req.body);

    if (error) {
        // detailsオブジェクトからmapでmessageを取得
        msg = error.details.map(obj => obj.message).join('.');  // joinする事で配列をStringに変換
        console.log(`message内容${msg}`);
        // エラーをスローする
        throw new ExpressError(msg, 400);
    } else {
        // エラーがない場合は次の処理に遷移
        next();
    }
}



app.get('/', (req, res) => {
    res.render('index');
    console.log(`リクエストタイム：${req.requestTIme}`);
})

// 一覧ページ
app.get('/cafe/index', async (req, res) => {
    // カフェの一覧を全件選択
    const cafes = await CafeInfo.find({});
    res.render('cafes/cafeindex', { cafes });
})

// 詳細ページ
app.get('/cafe/:id/detail', catchAsync(async (req, res) => { // catchAsyncでラップ
    // リクエストからidを取得
    const { id } = req.params;
    // クリックしたカフェのIDを元にデータを検索
    const cafe = await CafeInfo.findById(id).exec();
    // 詳細ページに遷移
    res.render('cafes/cafedetail', { cafe });
}))

// 登録ページへ遷移
app.get('/cafe/register', async (req, res) => {
    res.render('cafes/caferegister');
})

// 新規登録処理のルーティング
app.post('/cafe/register', validateCafe, catchAsync(async (req, res) => { // catchAsyncでWrapする
    // 登録日用日付データを作成
    const date = new Date();
    // データ型をString型に変換
    const dateText = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    // リクエストボディのうちcafeデータを取得
    let cafeData = req.body.cafe;
    // cafeデータに日付のデータを追加
    cafeData.registerDate = dateText;
    console.log(`リクエストボディの中身：${cafeData.shopName}`);

    // リクエストのデータを基にモデルをインスタンス化
    cafeData = new CafeInfo(cafeData);
    // データを登録する
    await cafeData.save();
    // 一覧画面にリダイレクト
    res.redirect("/cafe/index");
}))

app.get('/cafe/:id/edit', async (req, res) => {
    // リクエストからidを取得
    const { id } = req.params;
    // クリックしたカフェのIDを元にデータを検索
    const cafe = await CafeInfo.findById(id).exec();
    // 詳細ページに遷移
    res.render('cafes/cafeedit', { cafe });
})

app.put('/cafe/:id/edit', validateCafe, catchAsync(async (req, res) => {
    // リクエストからidを取得
    const { id } = req.params;
    // formデータを基にデータを更新（スプレッド構文を使って全てのプロパティを取得）
    const cafe = await CafeInfo.findByIdAndUpdate(id, { ...req.body.cafe }, { new: true });
    // 削除したデータをログで表示
    console.log(`${cafe.shopName}のデータを更新しました。`);
    // 詳細画面にリダイレクト
    res.redirect(`/cafe/${cafe.id}/edit`);
}))

app.delete('/cafe/:id/delete', async (req, res) => {
    // リクエストからidを取得
    const { id } = req.params;
    // idをキーにプロダクトを検索して削除する
    const cafe = await CafeInfo.findByIdAndDelete(id);
    // 削除したデータをログで表示
    console.log(`${cafe.shopName}データを削除しました。`);
    // 一覧画面にリダイレクト
    res.redirect("/cafe/index");
})

app.all('*', (req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした。', 404));
})


app.use((err, req, res, next) => {
    console.log(err.message);
    // errオブジェクトからステータスコードとメッセージを受け取る
    // デフォルト値も設定
    const { statusCode = 500, message = '問題が発生しました。' } = err;
    console.log(`${statusCode}エラー：${message}`)
    console.log(err.stack)
    // statusCode, messageをエラー用テンプレートに渡す
    res.status(statusCode).render('cafes/error', { statusCode, message });
})

app.listen(3000, () => {
    console.log('****ポート3000で待ち受け中****')
})