const sequelize = require('../config/database');
const Voter = require('./voter');
const User = require('./user');
const Election = require('./election');
const Candidate = require('./candidate');
const PollingUnit = require('./pollingUnit');
const Ballot = require('./ballot');
const AuditLog = require('./auditLog');
const Incident = require('./incident');

// Associations
User.belongsTo(Voter, { foreignKey: 'voter_id', as: 'voter' });
Voter.hasOne(User, { foreignKey: 'voter_id', as: 'user' });

Candidate.belongsTo(Election, { foreignKey: 'election_id', as: 'election' });
Election.hasMany(Candidate, { foreignKey: 'election_id', as: 'candidates' });

PollingUnit.belongsTo(User, { foreignKey: 'officer_id', as: 'officer' });
User.hasOne(PollingUnit, { foreignKey: 'officer_id', as: 'pollingUnit' });

Ballot.belongsTo(Election, { foreignKey: 'election_id', as: 'election' });
Ballot.belongsTo(Candidate, { foreignKey: 'candidate_id', as: 'candidate' });
Ballot.belongsTo(PollingUnit, { foreignKey: 'polling_unit_id', as: 'pollingUnit' });

Election.hasMany(Ballot, { foreignKey: 'election_id', as: 'ballots' });
Candidate.hasMany(Ballot, { foreignKey: 'candidate_id', as: 'ballots' });

Incident.belongsTo(User, { foreignKey: 'officer_id', as: 'officer' });
User.hasMany(Incident, { foreignKey: 'officer_id', as: 'incidents' });

module.exports = {
  sequelize,
  Voter,
  User,
  Election,
  Candidate,
  PollingUnit,
  Ballot,
  AuditLog,
  Incident,
};
