import PropTypes from 'prop-types';
import { Users, UserCheck, UserX, Building2 } from 'lucide-react';
import { StatCard } from '../../../components/common';

export default function CustomerStats({ customers }) {
  const stats = [
    { label: 'Total', value: customers.length, icon: Users, color: 'u-text-brand u-bg-brand-light' },
    { label: 'Active', value: customers.filter((c) => c.is_active).length, icon: UserCheck, color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30' },
    { label: 'Inactive', value: customers.filter((c) => !c.is_active).length, icon: UserX, color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30' },
    { label: 'Companies', value: customers.filter((c) => c.company_name).length, icon: Building2, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}

CustomerStats.propTypes = {
  customers: PropTypes.array.isRequired,
};