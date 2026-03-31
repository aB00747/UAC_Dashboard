import PropTypes from 'prop-types';
import { Upload } from 'lucide-react';
import { Button } from '../../../components/ui';

export default function CustomerImport({ importFile, setImportFile, saving, onImport, onClose, onTemplateDownload }) {
  return (
    <div className="p-5 space-y-4">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload Excel or CSV file</p>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setImportFile(e.target.files[0])}
          className="text-sm text-gray-700 dark:text-gray-300"
        />
      </div>
      <button
        onClick={onTemplateDownload}
        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
      >
        Download template file
      </button>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onImport} disabled={!importFile} loading={saving}>
          {saving ? 'Importing...' : 'Import'}
        </Button>
      </div>
    </div>
  );
}

CustomerImport.propTypes = {
  importFile: PropTypes.object,
  setImportFile: PropTypes.func,
  saving: PropTypes.bool,
  onImport: PropTypes.func,
  onClose: PropTypes.func,
  onTemplateDownload: PropTypes.func,
};