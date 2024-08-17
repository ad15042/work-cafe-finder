/**
 * ExpressErrorクラス
 * Errorクラスを継承して、自作エラークラスを定義する
 */
class ExpressError extends Error { //標準のエラーハンドラーを継承
    constructor(message, statusCode) {
        super(); //親クラスのコンストラクター呼び出し
        this.message = message; //引数で受け取ったメッセージをセット
        this.statusCode = statusCode; //引数で受け取ったエラーコードをセット
    }
}

// ExpressErrorをエクポート
module.exports = ExpressError;