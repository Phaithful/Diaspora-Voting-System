const crypto = require('crypto');

const generateOTP = () =>
  String(crypto.randomInt(100000, 999999));

const generateVoteToken = () =>
  crypto.randomBytes(32).toString('hex');

const isOTPExpired = (expiresAt) =>
  !expiresAt || new Date() > new Date(expiresAt);

module.exports = { generateOTP, generateVoteToken, isOTPExpired };
