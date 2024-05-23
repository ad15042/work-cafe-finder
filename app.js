// 各種ライブラリのインポート
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
// CafeInfoモデルのインポート
const CafeInfo = require('./models/cafeInfo');
// methodOverrideのオーバーライド
var methodOverride = require('method-override');

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
// ejsのディレクトリの設定
app.set('views', path.join(__dirname, 'views'));
// ejsをview エンジンに設定
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('index');
})

// 一覧ページ
app.get('/cafe/index', async (req, res) => {
    console.log('処理ここまで来ている')
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
    // formデータを基にデータを更新
    const cafe = await CafeInfo.findByIdAndUpdate(id, { ...req.body.cafe });
    // 一覧画面にリダイレクト
    res.redirect(`/cafe/${cafe.id}/edit`);
})

app.listen(3000, () => {
    console.log('****ポート3000で待ち受け中****')
})