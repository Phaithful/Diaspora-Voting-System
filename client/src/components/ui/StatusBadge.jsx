const STATUS_MAP = {
  REGISTERED: { label: 'Registered', cls: 'badge-blue' },
  ACCREDITED: { label: 'Accredited', cls: 'badge-yellow' },
  VOTED: { label: 'Voted', cls: 'badge-green' },
  SUSPENDED: { label: 'Suspended', cls: 'badge-red' },
  ACTIVE: { label: 'Active', cls: 'badge-green' },
  UPCOMING: { label: 'Upcoming', cls: 'badge-blue' },
  CLOSED: { label: 'Closed', cls: 'badge-gray' },
  OPEN: { label: 'Open', cls: 'badge-red' },
  RESOLVED: { label: 'Resolved', cls: 'badge-green' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_MAP[status] || { label: status, cls: 'badge-gray' };
  return <span className={config.cls}>{config.label}</span>;
};

export default StatusBadge;
