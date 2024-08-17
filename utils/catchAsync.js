/**
 * 非同期関数エラー捕捉共通処理
 * 非同期処理(async/await)で発生するエラーを補足するための共通処理。
 * 非同期関数を引数として受けとり、その処理で発生したエラーをcatchし、エラーハンドラに渡す。
 * 本関数を使用する事で各ルートハンドラにおけるtry~catchを省略が可能
 * @param {*} fn 
 * @returns  
 */
function catchAsync(fn) {
    return function (req, res, next) {
        // 引数として受け取った非同期関数でエラーが発生した場合にエラーハンドラに渡す
        fn(req, res, next).catch(err => next(err));
    }
}

module.exports = catchAsync;