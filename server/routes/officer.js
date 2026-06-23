const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { Voter, PollingUnit, Ballot, Incident, Election } = require('../models');
const { log } = require('../utils/audit');

// POST /api/officer/accredit
router.post('/accredit', authenticate, requireRole('OFFICER'), [
  body('pvc_number').trim().notEmpty().withMessage('PVC number required'),
  validate,
], async (req, res) => {
  try {
    const { pvc_number } = req.body;

    const pollingUnit = await PollingUnit.findOne({ where: { officer_id: req.user.id } });
    if (!pollingUnit) return res.status(403).json({ error: 'No polling unit assigned to this officer' });

    const voter = await Voter.findOne({ where: { pvc_number } });
    if (!voter) return res.status(404).json({ error: 'Voter not found with this PVC number' });

    if (voter.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'This voter account has been suspended' });
    }
    if (voter.status === 'VOTED') {
      return res.status(409).json({ error: 'This voter has already cast their vote' });
    }
    if (voter.status === 'ACCREDITED') {
      return res.status(409).json({ error: 'Voter is already accredited' });
    }

    await voter.update({ status: 'ACCREDITED', polling_unit_id: pollingUnit.id });
    await log(req, 'VOTER_ACCREDITED', {
      targetId: voter.id, targetType: 'voter',
      metadata: { pvc_number, polling_unit_id: pollingUnit.id },
    });

    return res.json({
      message: 'Voter accredited successfully',
      voter: {
        id: voter.id,
        full_name: voter.full_name,
        pvc_number: voter.pvc_number,
        status: 'ACCREDITED',
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Accreditation failed' });
  }
});

// GET /api/officer/stats
router.get('/stats', authenticate, requireRole('OFFICER'), async (req, res) => {
  try {
    const pollingUnit = await PollingUnit.findOne({ where: { officer_id: req.user.id } });
    if (!pollingUnit) return res.status(404).json({ error: 'No polling unit assigned' });

    const election = await Election.findOne({ where: { status: 'ACTIVE' } });
    const voteCount = election
      ? await Ballot.count({ where: { polling_unit_id: pollingUnit.id, election_id: election.id } })
      : 0;

    const accreditedCount = await Voter.count({
      where: { polling_unit_id: pollingUnit.id, status: ['ACCREDITED', 'VOTED'] },
    });

    const incidents = await Incident.findAll({
      where: { officer_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    return res.json({ pollingUnit, voteCount, accreditedCount, incidents });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/officer/incident
router.post('/incident', authenticate, requireRole('OFFICER'), [
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('incident_type').optional().trim(),
  validate,
], async (req, res) => {
  try {
    const { description, incident_type } = req.body;
    const pollingUnit = await PollingUnit.findOne({ where: { officer_id: req.user.id } });

    const incident = await Incident.create({
      officer_id: req.user.id,
      polling_unit_id: pollingUnit?.id || null,
      description,
      incident_type: incident_type || 'General',
      status: 'OPEN',
    });

    await log(req, 'INCIDENT_REPORTED', { targetId: incident.id, targetType: 'incident', metadata: { description: description.slice(0, 100) } });
    return res.status(201).json({ message: 'Incident reported', incident });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to report incident' });
  }
});

module.exports = router;
