import { X } from 'lucide-react';
import PropTypes from 'prop-types';

function Modal({ children, onClose, maxWidth = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center u-overlay">
      <div className={`u-panel w-full ${maxWidth} max-h-[90vh] overflow-y-auto m-4`}>
        {children}
      </div>
    </div>
  );
}

function Header({ children, onClose }) {
  return (
    <div className="flex items-center justify-between p-5 u-border-b">
      <h3 className="text-lg font-semibold u-text">{children}</h3>
      {onClose && (
        <button onClick={onClose} className="p-1 rounded u-btn u-btn--ghost">
          <X className="h-5 w-5" />
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
