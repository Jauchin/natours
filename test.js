const jwt = require('jsonwebtoken');
const base64url = require('base64url');

// 编码密钥
const secret = process.env.JWT_SECRET;
const encodedSecret = base64url.encode(secret);

// 生成 JWT
const token = jwt.sign({ id: 'user_id' }, encodedSecret, { expiresIn: '90d' });
console.log('Generated JWT:', token);

const jwt = require('jsonwebtoken');
const { promisify } = require('util');

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  try {
    const decoded = await promisify(jwt.verify)(token, encodedSecret);
    console.log('Decoded JWT:', decoded);
  } catch (err) {
    console.error('JWT verification error:', err);
    return next(new AppError('Invalid token. Please log in again!', 401));
  }

  next();
});
