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


const verifyPassword = (req, res, next) => {
    // リクエストのクエリの中にあるpasswordを分割代入で取得
    const { password } = req.query;
    // パスワードがsupersecretが判別
    if (password === "supersecret") {
        // nextを返す。（returnがないと以下のres.sendも実行されてしまう。）
        return next();
    }
    res.send('パスワードが違います。')
}

app.get('/secret', verifyPassword, (req, res) => {
    res.send('ここは秘密のページです。');
})

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
app.get('/cafe/:id/detail', async (req, res) => {
    // リクエストからidを取得
    const { id } = req.params;
    // クリックしたカフェのIDを元にデータを検索
    const cafe = await CafeInfo.findById(id).exec();
    // 詳細ページに遷移
    res.render('cafes/cafedetail', { cafe });
})

// 登録ページへ遷移
app.get('/cafe/register', async (req, res) => {
    res.render('cafes/caferegister');
})

// 新規登録処理のルーティング
app.post('/cafe/register', async (req, res) => {
    // 登録日用日付データを作成
    const date = new Date();
    // データ型をString型に変換
    const dateText = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    // リクエストボディのうちcafeデータを取得
    let cafeData = req.body.cafe;
    // cafeデータに日付のデータを追加
    cafeData.registerDate = dateText;
    // リクエストのデータを基にモデルをインスタンス化
    cafeData = new CafeInfo(cafeData);
    // データを登録する
    await cafeData.save();
    // 一覧画面にリダイレクト
    res.redirect("/cafe/index");
})

app.get('/cafe/:id/edit', async (req, res) => {
    // リクエストからidを取得
    const { id } = req.params;
    // クリックしたカフェのIDを元にデータを検索
    const cafe = await CafeInfo.findById(id).exec();
    // 詳細ページに遷移
    res.render('cafes/cafeedit', { cafe });
})

app.put('/cafe/:id/edit', async (req, res) => {
    // リクエストからidを取得
    const { id } = req.params;
    // formデータを基にデータを更新（スプレッド構文を使って全てのプロパティを取得）
    const cafe = await CafeInfo.findByIdAndUpdate(id, { ...req.body.cafe }, { new: true });
    // 削除したデータをログで表示
    console.log(`${cafe.shopName}のデータを更新しました。`);
    // 詳細画面にリダイレクト
    res.redirect(`/cafe/${cafe.id}/edit`);
})

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



app.listen(3000, () => {
    console.log('****ポート3000で待ち受け中****')
})