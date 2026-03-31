import PropTypes from 'prop-types';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, message = 'No data found' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  message: PropTypes.string,
}