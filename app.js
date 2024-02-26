// 各種ライブラリのインポート
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
// CafeInfoモデルのインポート
const CafeInfo = require('./models/cafeInfo');

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

// ejsのディレクトリの設定
app.set('views', path.join(__dirname, 'views'));
// ejsをview エンジンに設定
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('index');
})

// テスト用データ作成ルーティング
app.get('/makecafeinfo', async (req, res) => {
    const cafe = new CafeInfo({
        shopName: "スターバックス",
        priceOfcoffee: 300,
        hasWiFi: true,
        wifiStrength: 60,
        comfort: 6,
        comment: "普通のスタバ",
    });
    await cafe.save();
    res.send(cafe);
})

app.listen(3000, () => {
    console.log('****ポート3000で待ち受け中****')
})