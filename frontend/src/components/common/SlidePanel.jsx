import PropTypes from 'prop-types';
import { X } from 'lucide-react';

export default function SlidePanel({ title, onClose, width = 'w-96', children }) {
  return (
    <div className={`fixed inset-y-0 right-0 ${width} bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-40 overflow-y-auto`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

SlidePanel.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  width: PropTypes.string,
  children: PropTypes.node.isRequired,
};