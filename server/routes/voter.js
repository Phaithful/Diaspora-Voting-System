const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { Voter, Election, Candidate, Ballot, PollingUnit } = require('../models');
const { generateVoteToken } = require('../utils/otp');
const { log } = require('../utils/audit');

// GET /api/voter/me
router.get('/me', authenticate, requireRole('VOTER'), async (req, res) => {
  try {
    const voter = await Voter.findByPk(req.user.voter_id);
    if (!voter) return res.status(404).json({ error: 'Voter record not found' });
    return res.json({ voter });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/voter/election
router.get('/election', authenticate, requireRole('VOTER'), async (req, res) => {
  try {
    const election = await Election.findOne({
      where: { status: 'ACTIVE' },
      include: [{ model: Candidate, as: 'candidates', order: [['position', 'ASC']] }],
    });
    if (!election) return res.status(404).json({ error: 'No active election found' });
    return res.json({ election });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch election' });
  }
});

// POST /api/voter/vote
router.post('/vote', authenticate, requireRole('VOTER'), async (req, res) => {
  try {
    const voter = await Voter.findByPk(req.user.voter_id);
    if (!voter) return res.status(404).json({ error: 'Voter not found' });

    if (voter.status === 'VOTED') {
      return res.status(409).json({ error: 'You have already cast your vote' });
    }
    if (voter.status !== 'ACCREDITED') {
      return res.status(403).json({ error: 'You must be accredited by a polling officer before voting' });
    }

    const { candidate_id, election_id } = req.body;
    if (!candidate_id || !election_id) {
      return res.status(422).json({ error: 'candidate_id and election_id are required' });
    }

    const election = await Election.findByPk(election_id);
    if (!election || election.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Election is not currently active' });
    }

    const candidate = await Candidate.findOne({ where: { id: candidate_id, election_id } });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found for this election' });

    const pollingUnit = await PollingUnit.findByPk(voter.polling_unit_id);
    if (!pollingUnit) return res.status(400).json({ error: 'No polling unit assigned to voter' });

    const vote_token = generateVoteToken();

    await Ballot.create({
      election_id,
      candidate_id,
      polling_unit_id: pollingUnit.id,
      vote_token,
      cast_at: new Date(),
    });

    await voter.update({ status: 'VOTED' });
    await log(req, 'VOTE_CAST', { targetId: election_id, targetType: 'election', metadata: { polling_unit_id: pollingUnit.id } });

    return res.status(201).json({ message: 'Vote cast successfully', vote_token, cast_at: new Date() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to cast vote' });
  }
});

// GET /api/voter/receipt
router.get('/receipt', authenticate, requireRole('VOTER'), async (req, res) => {
  try {
    const voter = await Voter.findByPk(req.user.voter_id);
    if (!voter) return res.status(404).json({ error: 'Voter not found' });
    if (voter.status !== 'VOTED') {
      return res.status(404).json({ error: 'No vote record found' });
    }
    return res.json({
      status: 'VOTED',
      message: 'Your vote has been recorded securely',
      voter_name: voter.full_name,
      timestamp: voter.updatedAt,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

module.exports = router;
