import { X } from 'lucide-react';
import PropTypes from 'prop-types';

function Modal({ children, onClose, maxWidth = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto m-4`}>
        {children}
      </div>
    </div>
  );
}

function Header({ children, onClose }) {
  return (
    <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{children}</h3>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
}

function Body({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

function Footer({ children }) {
  return (
    <div className="flex justify-end gap-3 px-5 pb-5 pt-2">
      {children}
    </div>
  );
}

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  maxWidth: PropTypes.string,
};

Header.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
};

Body.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Footer.propTypes = {
  children: PropTypes.node.isRequired,
};
