import PropTypes from 'prop-types';
import { X } from 'lucide-react';

export default function SlidePanel({ title, onClose, width = 'w-96', children }) {
  return (
    <div className={`fixed inset-y-0 right-0 ${width} u-bg-surface u-border-l shadow-xl z-40 overflow-y-auto`}>
      <div className="flex items-center justify-between p-4 u-border-b">
        <h3 className="font-semibold u-text">{title}</h3>
        <button onClick={onClose} className="p-1 rounded u-btn u-btn--ghost">
          <X className="h-5 w-5" />
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
