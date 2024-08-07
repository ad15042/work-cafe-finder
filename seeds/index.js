/**
 * cafeInfoコレクションに初期データを投入するためのスクリプト
 */

const mongoose = require('mongoose');
const CafeInfo = require('../models/cafeInfo');
const wardOfTokyo = require("./ward-of-tokyo.json");

// wardOfTokyoをJSONからオブジェクトにパースする
// const parsedWardOfTokyo = JSON.parse(wardOfTokyo);


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

// テスト用のカフェ名
const sampleCafe = ["スターバックス", "タリーズコーヒー", "ドトール", "エクセルシオール", "珈琲館"];

// 生成するカフェ情報の数
const numberOfCafes = 10;

/**
 * シードデータ生成処理
 * cafeInfoコレクションに登録するシードデータを生成する。
 * @returns なし
 */
const seedCafes = async () => {
    try {
        // 全件データ削除
        await CafeInfo.deleteMany({});

        // テストデータ生成
        const testData = [];

        // 日付データを作成
        const testDate = new Date();
        const testDateText = `${testDate.getFullYear()}年${testDate.getMonth() + 1}月${testDate.getDate()}日`;

        // 生成したデータの数だけループしてデータを生成する
        for (let i = 0; i <= numberOfCafes; i++) {
            const imageUrl = await getRandomImage(); // 非同期で画像URLを取得
            testData.push({
                shopName: `${sampleCafe[Math.floor(Math.random() * 5)]}`, // テスト用カフェ名からランダムに生成
                priceOfcoffee: Math.floor(Math.random() * 1000) + 300, // 300〜1300円のランダムな価格
                location: `東京都${getRandomWard()}`, // 東京23区内のランダムな区
                hasWiFi: Math.random() < 0.8, // WiFiの有無をランダムに設定（80%の確率でtrue）
                wifiStrength: Math.floor(Math.random() * 100), // WiFiの強度を0〜100のランダムな値で設定
                comfort: Math.floor(Math.random() * 11), // 快適さを0〜10のランダムな値で設定
                comment: 'テストコメント',
                registerDate: testDateText,
                image: imageUrl, // 取得した画像URLを代入
            });

        }
        // テストデータをMongoDBに登録
        return CafeInfo.insertMany(testData);

    } catch (error) {
        console.error('エラーが発生しました:', error);

    }
}

/**
 * 区名取得処理
 * 1~23までのランダムな数字を生成し、
 * それに対応した東京都の区名をward-of-tokyoから取得する
 * @returns ward-of-tokyoから取得した区の名前
 */
const getRandomWard = () => {
    let ramdomNum = Math.floor(Math.random() * 23) + 1;
    const wardName = wardOfTokyo.filter(x => x.code == ramdomNum) // ramdomNumがキーワードと一致するオブジェクトのみをフィルタリング
        .map(x => x.name) // フィルタリングされたオブジェクトのnameフィールドのみを取り出す
    [0] ?? null; // 取り出したnameの配列から最初の要素を取得、もし配列が空ならばnullを返す
    return wardName
}


/**
 * ランダムな画像取得処理
 * 高画質な画像を配布しているUnsplashが提供しているUnsplash APIを使用して
 * シードデータ用のいい感じのカフェの画像データをランダムに取得する
 * Fetch APIを使用して指定のURLにリクエストを投げ、レスポンスから画像情報を取得
 * @returns Unsplashから取得した画像データのURL
 */
const getRandomImage = async () => {
    // 検索キーワード
    const query = "cafe-interior";
    // アクセスキー
    const accessKey = "hzeNEyqqUWMTlhgJbhLCOluqHtzaAG8932YC9DkEUGQ";
    // 画像データの取得数
    const count = 1;
    // リクエスト用URL
    url = `https://api.unsplash.com/photos/random?query=${query}`;
    try {
        // Fetch APIを使用
        const res = await fetch(url, {
            // APIキーはAuthorizationヘッダーに含めて送信
            headers: {
                Authorization: `Client-ID ${accessKey}`
            }
        })

        // レスポンスが異常の場合はエラーをスロー
        if (!res.ok) {
            throw new Error('Network response was not ok ' + res.statusText);
        }

        // レスポンスをJSON形式でパースし、画像のURLを取得
        const data = await res.json();
        // レスポンスから画像のURLを取得
        const imageUrl = data.urls.regular;
        console.log(imageUrl);

        return imageUrl;

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// seedCafes関数を呼び出してデータを追加
seedCafes()
    .then(() => {
        mongoose.connection.close();
    });