import PropTypes from 'prop-types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function ConfirmDialog({ open, title = 'Confirm', message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  if (!open) return null;
  return (
    <Modal onClose={onCancel}>
      <Modal.Header onClose={onCancel}>{title}</Modal.Header>
      <Modal.Body>
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </Modal.Footer>
    </Modal>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string,
  danger: PropTypes.bool,
};
