const router = require('express').Router();
const { Election, Candidate, Ballot, PollingUnit } = require('../models');

// GET /api/results — public live results
router.get('/', async (req, res) => {
  try {
    const election = await Election.findOne({
      where: { status: ['ACTIVE', 'CLOSED'] },
      include: [{
        model: Candidate, as: 'candidates',
        include: [{ model: Ballot, as: 'ballots', attributes: ['id'] }],
        order: [['position', 'ASC']],
      }],
      order: [['created_at', 'DESC']],
    });

    if (!election) {
      return res.json({ election: null, results: [], totalVotes: 0, unitsReporting: 0 });
    }

    const totalVotes = await Ballot.count({ where: { election_id: election.id } });
    const unitsReporting = await Ballot.count({
      distinct: true,
      col: 'polling_unit_id',
      where: { election_id: election.id },
    });
    const totalUnits = await PollingUnit.count({ where: { is_active: true } });

    const results = election.candidates
      .map((c) => ({
        id: c.id,
        full_name: c.full_name,
        party: c.party,
        party_acronym: c.party_acronym,
        photo_url: c.photo_url,
        votes: c.ballots.length,
        percentage: totalVotes > 0 ? ((c.ballots.length / totalVotes) * 100).toFixed(2) : '0.00',
      }))
      .sort((a, b) => b.votes - a.votes);

    return res.json({
      election: { id: election.id, title: election.title, status: election.status, end_date: election.end_date },
      results,
      totalVotes,
      unitsReporting,
      totalUnits,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
});

module.exports = router;
