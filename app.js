// 各種ライブラリのインポート
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
// CafeInfoモデル
const CafeInfo = require('./models/cafeInfo');
// Reviewモデル
const Review = require('./models/review');
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
const { cafeSchema, reviewSchema } = require('./schema');
// cafeRouterをインポート
const cafeRouter = require('./router/cafe_router');
// reviewRouterをインポート
const reviewRouter = require('./router/review_router');
// sessionを使うためのライブラリ
const session = require('express-session');
// flashメッセージを使うためのライブラリ
const flash = require('connect-flash');

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
app.use(express.static(path.join(__dirname, 'public'))); // 静的ファイルのディレクトリを設定

// sessionののコンフィグを定義
const sessionConfig = {
    secret: 'my-secret-key', // セッションの秘密鍵
    resave: false, // セッションが変更されていなくても再保存するかどうか
    saveUninitialized: true, // 初期化されていないセッションを保存するかどうか
    cookie: {
        httpOnly: true, // クライアント側のJavaScriptからアクセスできないようにする
        secure: false, // HTTPSを使用している場合はtrueに設定
        maxAge: 1000 * 60 * 60 * 24 // クッキーの有効期限（ここでは1日）
    }
}
// セッションの設定
app.use(session(sessionConfig));
// フラッシュメッセージの設定
app.use(flash());
// リクエストのタイムスタンプを追加するミドルウェア
app.use((req, res, next) => {
    // リクエストのタイムスタンプを追加
    req.requestTIme = new Date().toLocaleString();
    // フラッシュメッセージをres.localsに設定
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

/** トップページ */
app.get('/', (req, res) => {
    res.render('index');
    console.log(`リクエストタイム：${req.requestTIme}`);
})

// cafeRouterを使って、/cafe以下のルーティングを設定
app.use('/cafe', cafeRouter);
// reviewRouterを使って、/cafe以下のレビュー関連のルーティングを設定
app.use('/cafe/:id/reviews/', reviewRouter);

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