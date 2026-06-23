const router = require('express').Router();
const { body, query } = require('express-validator');
const { Op } = require('sequelize');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { sequelize, Election, Candidate, Voter, User, Ballot, AuditLog, PollingUnit, Incident } = require('../models');
const { log } = require('../utils/audit');
const bcrypt = require('bcrypt');

// --- Dashboard ---
router.get('/dashboard', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const [totalVoters, accreditedVoters, votedVoters, suspendedVoters, activeElection, activeUnits] =
      await Promise.all([
        Voter.count(),
        Voter.count({ where: { status: 'ACCREDITED' } }),
        Voter.count({ where: { status: 'VOTED' } }),
        Voter.count({ where: { status: 'SUSPENDED' } }),
        Election.findOne({ where: { status: 'ACTIVE' } }),
        PollingUnit.count({ where: { is_active: true } }),
      ]);

    const totalVotes = await Ballot.count(
      activeElection ? { where: { election_id: activeElection.id } } : {}
    );
    const turnoutPct = totalVoters > 0 ? ((votedVoters / totalVoters) * 100).toFixed(1) : 0;

    return res.json({
      totalVoters, accreditedVoters, votedVoters, suspendedVoters,
      totalVotes, turnoutPct, activeUnits,
      activeElection: activeElection || null,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Dashboard fetch failed' });
  }
});

// --- Elections ---
router.get('/elections', authenticate, requireRole('ADMIN'), async (req, res) => {
  const elections = await Election.findAll({ order: [['created_at', 'DESC']] });
  return res.json({ elections });
});

router.post('/elections', authenticate, requireRole('ADMIN'), [
  body('title').trim().notEmpty(),
  body('start_date').isISO8601(),
  body('end_date').isISO8601(),
  validate,
], async (req, res) => {
  try {
    const { title, description, election_type, start_date, end_date, status } = req.body;
    const election = await Election.create({ title, description, election_type, start_date, end_date, status: status || 'UPCOMING' });
    await log(req, 'ELECTION_CREATED', { targetId: election.id, targetType: 'election', metadata: { title } });
    return res.status(201).json({ election });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create election' });
  }
});

router.patch('/elections/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const election = await Election.findByPk(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    await election.update(req.body);
    await log(req, 'ELECTION_UPDATED', { targetId: election.id, targetType: 'election', metadata: req.body });
    return res.json({ election });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update election' });
  }
});

// --- Candidates ---
router.get('/candidates', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { election_id } = req.query;
  const where = election_id ? { election_id } : {};
  const candidates = await Candidate.findAll({ where, include: [{ model: Election, as: 'election' }], order: [['position', 'ASC']] });
  return res.json({ candidates });
});

router.post('/candidates', authenticate, requireRole('ADMIN'), [
  body('election_id').notEmpty(),
  body('full_name').trim().notEmpty(),
  body('party').trim().notEmpty(),
  body('party_acronym').trim().notEmpty(),
  validate,
], async (req, res) => {
  try {
    const candidate = await Candidate.create(req.body);
    await log(req, 'CANDIDATE_ADDED', { targetId: candidate.id, targetType: 'candidate', metadata: { full_name: candidate.full_name, party: candidate.party } });
    return res.status(201).json({ candidate });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add candidate' });
  }
});

router.patch('/candidates/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    await candidate.update(req.body);
    return res.json({ candidate });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update candidate' });
  }
});

router.delete('/candidates/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    await candidate.destroy();
    await log(req, 'CANDIDATE_REMOVED', { targetId: req.params.id, targetType: 'candidate' });
    return res.json({ message: 'Candidate removed' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove candidate' });
  }
});

// --- Voters ---
router.get('/voters', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { nin: { [Op.iLike]: `%${search}%` } },
        { pvc_number: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: voters } = await Voter.findAndCountAll({
      where, limit: parseInt(limit), offset, order: [['created_at', 'DESC']],
    });
    return res.json({ voters, total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch voters' });
  }
});

router.patch('/voters/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const voter = await Voter.findByPk(req.params.id);
    if (!voter) return res.status(404).json({ error: 'Voter not found' });
    const { status } = req.body;
    if (status) await voter.update({ status });
    await log(req, 'VOTER_STATUS_CHANGED', { targetId: voter.id, targetType: 'voter', metadata: { status } });
    return res.json({ voter });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update voter' });
  }
});

// --- Results ---
router.get('/results', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { election_id } = req.query;
    const electionWhere = election_id ? { id: election_id } : { status: ['ACTIVE', 'CLOSED'] };
    const election = await Election.findOne({
      where: electionWhere,
      include: [{
        model: Candidate, as: 'candidates',
        include: [{ model: Ballot, as: 'ballots', attributes: ['id'] }],
      }],
      order: [['created_at', 'DESC']],
    });
    if (!election) return res.status(404).json({ error: 'No election found' });

    const totalVotes = await Ballot.count({ where: { election_id: election.id } });
    const results = election.candidates.map((c) => ({
      id: c.id,
      full_name: c.full_name,
      party: c.party,
      party_acronym: c.party_acronym,
      photo_url: c.photo_url,
      votes: c.ballots.length,
      percentage: totalVotes > 0 ? ((c.ballots.length / totalVotes) * 100).toFixed(2) : '0.00',
    })).sort((a, b) => b.votes - a.votes);

    return res.json({ election: { id: election.id, title: election.title, status: election.status }, results, totalVotes });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// --- Export CSV ---
router.get('/export-results', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const election = await Election.findOne({
      where: { status: ['ACTIVE', 'CLOSED'] },
      include: [{
        model: Candidate, as: 'candidates',
        include: [{ model: Ballot, as: 'ballots', attributes: ['id', 'cast_at'] }],
      }],
    });
    if (!election) return res.status(404).json({ error: 'No election found' });

    const totalVotes = election.candidates.reduce((sum, c) => sum + c.ballots.length, 0);
    const rows = [
      ['Candidate', 'Party', 'Acronym', 'Votes', 'Percentage'],
      ...election.candidates
        .sort((a, b) => b.ballots.length - a.ballots.length)
        .map((c) => [
          c.full_name, c.party, c.party_acronym,
          c.ballots.length,
          totalVotes > 0 ? ((c.ballots.length / totalVotes) * 100).toFixed(2) + '%' : '0.00%',
        ]),
      ['', '', 'TOTAL', totalVotes, '100%'],
    ];

    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=results_${election.id}.csv`);
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ error: 'Export failed' });
  }
});

// --- Audit Log ---
router.get('/audit-log', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 30, action } = req.query;
    const where = action ? { action } : {};
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where, limit: parseInt(limit), offset,
      order: [['timestamp', 'DESC']],
    });
    return res.json({ logs, total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// --- Polling Units ---
router.get('/polling-units', authenticate, requireRole('ADMIN'), async (req, res) => {
  const units = await PollingUnit.findAll({ include: [{ model: require('../models').User, as: 'officer', attributes: ['id', 'email', 'full_name'] }] });
  return res.json({ units });
});

// --- Incidents ---
router.get('/incidents', authenticate, requireRole('ADMIN'), async (req, res) => {
  const incidents = await Incident.findAll({
    include: [{ model: require('../models').User, as: 'officer', attributes: ['id', 'email', 'full_name'] }],
    order: [['created_at', 'DESC']],
  });
  return res.json({ incidents });
});

router.patch('/incidents/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    await incident.update({ status: 'RESOLVED', resolved_at: new Date(), resolution_notes: req.body.resolution_notes });
    return res.json({ incident });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resolve incident' });
  }
});

module.exports = router;
