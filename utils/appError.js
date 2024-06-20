class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    //Error.captureStackTrace 是一個非常有用的工具，特別是在創建自定義錯誤類時。它能夠捕獲並準備錯誤的堆棧追蹤信息，幫助開發者更準確地定位錯誤發生的位置，從而更有效地進行調試和問題排查。
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
