import PropTypes from 'prop-types';

export default function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="u-stat-card p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs u-text-3">{label}</p>
        <p className="text-lg font-bold u-text">{value}</p>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
};
