const router = require('express').Router();
const bcrypt = require('bcrypt');
const { body } = require('express-validator');
const { Op } = require('sequelize');
const { User, Voter } = require('../models');
const { validate } = require('../middleware/validate');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateOTP, isOTPExpired } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/mailer');
const { log } = require('../utils/audit');

// POST /api/auth/register
router.post('/register', [
  body('nin').trim().isLength({ min: 11, max: 11 }).withMessage('NIN must be exactly 11 digits')
    .isNumeric().withMessage('NIN must contain digits only'),
  body('pvc_number').trim().notEmpty().withMessage('PVC number is required'),
  body('full_name').trim().isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
  body('email').trim().isEmail().withMessage('Valid email address required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('country_of_residence').trim().notEmpty().withMessage('Country of residence is required'),
  validate,
], async (req, res) => {
  try {
    const {
      nin, pvc_number, full_name, email, password,
      country_of_residence, passport_no, date_of_birth,
    } = req.body;

    // Normalise email consistently (lowercase, trimmed)
    const normalizedEmail = email.trim().toLowerCase();

    const existingNIN = await Voter.findOne({ where: { nin } });
    if (existingNIN) return res.status(409).json({ error: 'NIN already registered' });

    const existingPVC = await Voter.findOne({ where: { pvc_number } });
    if (existingPVC) return res.status(409).json({ error: 'PVC number already registered' });

    const existingEmail = await User.findOne({ where: { email: normalizedEmail } });
    if (existingEmail) return res.status(409).json({ error: 'Email already registered' });

    const voter = await Voter.create({
      nin,
      pvc_number,
      full_name,
      email: normalizedEmail,
      country_of_residence,
      passport_no: passport_no || null,
      date_of_birth: date_of_birth || null,
      status: 'REGISTERED',
    });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      voter_id: voter.id,
      email: normalizedEmail,
      password_hash,
      full_name,
      role: 'VOTER',
    });

    await log(req, 'VOTER_REGISTER', { targetId: voter.id, targetType: 'voter', metadata: { email: normalizedEmail } });

    return res.status(201).json({ message: 'Registration successful', userId: user.id });
  } catch (err) {
    console.error('[Register Error]', err);
    const isDev = process.env.NODE_ENV !== 'production';
    return res.status(500).json({
      error: 'Registration failed',
      ...(isDev && { detail: err.message }),
    });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
], async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await log(req, 'LOGIN_FAILED', { targetId: user.id, targetType: 'user', status: 'FAILURE', metadata: { email } });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check OTP lockout
    if (user.otp_locked_until && new Date() < new Date(user.otp_locked_until)) {
      const remaining = Math.ceil((new Date(user.otp_locked_until) - new Date()) / 1000 / 60);
      return res.status(429).json({ error: `Account locked. Try again in ${remaining} minute(s).` });
    }

    const otp = generateOTP();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
    await user.update({ otp, otp_expires_at, otp_attempts: 0 });

    try {
      await sendOTPEmail(email, user.full_name || email, otp);
    } catch (mailErr) {
      console.error('[Mail] OTP send failed:', mailErr.message);
    }

    return res.json({ message: 'OTP sent to your email', email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', [
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  validate,
], async (req, res) => {
  try {
    const otp = req.body.otp;
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid request' });

    if (user.otp_locked_until && new Date() < new Date(user.otp_locked_until)) {
      return res.status(429).json({ error: 'Account locked due to too many attempts' });
    }

    if (user.otp !== otp || isOTPExpired(user.otp_expires_at)) {
      const attempts = (user.otp_attempts || 0) + 1;
      const updates = { otp_attempts: attempts };
      if (attempts >= 3) {
        updates.otp_locked_until = new Date(Date.now() + 15 * 60 * 1000);
        updates.otp = null;
      }
      await user.update(updates);
      return res.status(401).json({
        error: attempts >= 3
          ? 'Too many attempts. Account locked for 15 minutes.'
          : `Invalid or expired OTP. ${3 - attempts} attempt(s) remaining.`,
      });
    }

    await user.update({ otp: null, otp_expires_at: null, otp_attempts: 0, otp_locked_until: null, last_login: new Date() });

    const payload = { id: user.id, email: user.email, role: user.role, voter_id: user.voter_id };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await user.update({ refresh_token: refreshToken });

    await log(req, 'LOGIN_SUCCESS', { targetId: user.id, targetType: 'user', metadata: { email, role: user.role } });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken,
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, voter_id: user.voter_id },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'OTP verification failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) return res.status(401).json({ error: 'Refresh token required' });
  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findByPk(decoded.id);
    if (!user || user.refresh_token !== token || !user.is_active) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    const payload = { id: user.id, email: user.email, role: user.role, voter_id: user.voter_id };
    const accessToken = signAccessToken(payload);
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      await User.update({ refresh_token: null }, { where: { id: decoded.id } });
    } catch {}
  }
  res.clearCookie('refreshToken');
  return res.json({ message: 'Logged out successfully' });
});

module.exports = router;
