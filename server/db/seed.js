require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcrypt');
const { sequelize, Voter, User, Election, Candidate, PollingUnit, AuditLog } = require('../models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✓ Database synced');

    // --- Polling Units ---
    const units = await PollingUnit.bulkCreate([
      { name: 'Nigerian High Commission — London', country: 'United Kingdom', city: 'London', address: '9 Northumberland Avenue, London WC2N 5BX' },
      { name: 'Nigerian Consulate General — New York', country: 'United States', city: 'New York', address: '828 Second Ave, New York, NY 10017' },
      { name: 'Nigerian Consulate — Dubai', country: 'United Arab Emirates', city: 'Dubai', address: 'Villa 9, Street 6B, Jumeirah 1, Dubai' },
    ]);
    console.log('✓ Polling units created');

    // --- Admin User ---
    const adminPwd = await bcrypt.hash('Admin@2027!', 12);
    await User.create({
      email: 'admin@vote.ng',
      password_hash: adminPwd,
      full_name: 'INEC Administrator',
      role: 'ADMIN',
    });
    console.log('✓ Admin created (admin@vote.ng / Admin@2027!)');

    // --- Officers ---
    const officerPwd = await bcrypt.hash('Officer@2027!', 12);
    const officers = await User.bulkCreate([
      { email: 'officer.london@vote.ng', password_hash: officerPwd, full_name: 'Chukwuemeka Obi', role: 'OFFICER' },
      { email: 'officer.ny@vote.ng', password_hash: officerPwd, full_name: 'Adaobi Nwosu', role: 'OFFICER' },
      { email: 'officer.dubai@vote.ng', password_hash: officerPwd, full_name: 'Babatunde Alabi', role: 'OFFICER' },
    ]);
    console.log('✓ Officers created (password: Officer@2027!)');

    // Link officers to polling units
    await units[0].update({ officer_id: officers[0].id });
    await units[1].update({ officer_id: officers[1].id });
    await units[2].update({ officer_id: officers[2].id });

    // --- Voters ---
    const voterPwd = await bcrypt.hash('Voter@2027!', 12);
    const voterData = [
      { nin: '12345678901', pvc_number: 'PVC/LG/001/2027', full_name: 'Emeka Okafor', email: 'emeka.okafor@gmail.com', country_of_residence: 'United Kingdom' },
      { nin: '23456789012', pvc_number: 'PVC/NY/002/2027', full_name: 'Ngozi Adeyemi', email: 'ngozi.adeyemi@gmail.com', country_of_residence: 'United States' },
      { nin: '34567890123', pvc_number: 'PVC/DB/003/2027', full_name: 'Tunde Fashola', email: 'tunde.fashola@yahoo.com', country_of_residence: 'United Arab Emirates' },
      { nin: '45678901234', pvc_number: 'PVC/LG/004/2027', full_name: 'Amaka Eze', email: 'amaka.eze@hotmail.com', country_of_residence: 'United Kingdom' },
      { nin: '56789012345', pvc_number: 'PVC/NY/005/2027', full_name: 'Segun Bello', email: 'segun.bello@gmail.com', country_of_residence: 'United States' },
      { nin: '67890123456', pvc_number: 'PVC/DB/006/2027', full_name: 'Chidinma Okeke', email: 'chidinma.okeke@gmail.com', country_of_residence: 'United Arab Emirates' },
      { nin: '78901234567', pvc_number: 'PVC/LG/007/2027', full_name: 'Femi Adesanya', email: 'femi.adesanya@gmail.com', country_of_residence: 'United Kingdom' },
      { nin: '89012345678', pvc_number: 'PVC/NY/008/2027', full_name: 'Kelechi Nnamdi', email: 'kelechi.nnamdi@gmail.com', country_of_residence: 'United States' },
      { nin: '90123456789', pvc_number: 'PVC/DB/009/2027', full_name: 'Blessing Okonkwo', email: 'blessing.okonkwo@gmail.com', country_of_residence: 'Canada' },
      { nin: '01234567890', pvc_number: 'PVC/LG/010/2027', full_name: 'Yusuf Ibrahim', email: 'yusuf.ibrahim@gmail.com', country_of_residence: 'United Kingdom' },
    ];

    for (const vd of voterData) {
      const voter = await Voter.create({ ...vd, status: 'REGISTERED' });
      await User.create({ voter_id: voter.id, email: vd.email, password_hash: voterPwd, full_name: vd.full_name, role: 'VOTER' });
    }
    console.log('✓ 10 voters created (password: Voter@2027!)');

    // --- Election ---
    const election = await Election.create({
      title: '2027 Nigerian Presidential Election — Diaspora Voting',
      description: 'The Federal Republic of Nigeria General Presidential Election for the term 2027–2031. Eligible diaspora voters cast their ballots at designated consulate polling units worldwide.',
      election_type: 'Presidential',
      start_date: new Date('2027-02-27T08:00:00Z'),
      end_date: new Date('2027-02-27T18:00:00Z'),
      status: 'ACTIVE',
    });
    console.log('✓ Election created');

    // --- Candidates ---
    await Candidate.bulkCreate([
      {
        election_id: election.id,
        full_name: 'Alhaji Musa Ibrahim Tanko',
        party: 'All Progressives Congress',
        party_acronym: 'APC',
        bio: 'Former Governor of Kano State with 12 years of public service. Advocates for economic diversification and infrastructure development.',
        position: 1,
      },
      {
        election_id: election.id,
        full_name: 'Chief Emeka Obiora Nwosu',
        party: "People's Democratic Party",
        party_acronym: 'PDP',
        bio: 'Veteran statesman and former Minister of Finance. Committed to social welfare reforms and agricultural transformation.',
        position: 2,
      },
      {
        election_id: election.id,
        full_name: 'Dr. Ngozi Adaobi Okonkwo',
        party: 'Labour Party',
        party_acronym: 'LP',
        bio: 'Renowned economist and grassroots activist. Champions youth empowerment and technology-driven governance.',
        position: 3,
      },
      {
        election_id: election.id,
        full_name: 'Sen. Rabiu Abdullahi Musa',
        party: 'New Nigeria Peoples Party',
        party_acronym: 'NNPP',
        bio: 'Two-term senator from Katsina State. Advocates for Northern development and educational investment.',
        position: 4,
      },
      {
        election_id: election.id,
        full_name: 'Barr. Adunola Folawiyo',
        party: 'African Democratic Congress',
        party_acronym: 'ADC',
        bio: 'Human rights lawyer and civil society leader. Focuses on constitutional reform and anti-corruption measures.',
        position: 5,
      },
    ]);
    console.log('✓ 5 candidates created (APC, PDP, LP, NNPP, ADC)');

    console.log('\n========================================');
    console.log('SEED COMPLETE — Login Credentials:');
    console.log('========================================');
    console.log('ADMIN:   admin@vote.ng / Admin@2027!');
    console.log('OFFICER: officer.london@vote.ng / Officer@2027!');
    console.log('OFFICER: officer.ny@vote.ng / Officer@2027!');
    console.log('OFFICER: officer.dubai@vote.ng / Officer@2027!');
    console.log('VOTER:   emeka.okafor@gmail.com / Voter@2027!');
    console.log('VOTER:   ngozi.adeyemi@gmail.com / Voter@2027!');
    console.log('(all 10 voters use password: Voter@2027!)');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
