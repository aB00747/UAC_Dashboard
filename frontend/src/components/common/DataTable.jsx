import PropTypes from 'prop-types';
import { InlineSpinner } from '../ui/Spinner';

export default function DataTable({ columns, data, loading, emptyMessage = 'No data found', onRowClick, renderRow }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  className={`py-3 px-4 font-medium text-gray-500 dark:text-gray-400 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center">
                  <InlineSpinner />
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading && data.length > 0 && (
              <>
                {data.map((item, idx) => renderRow(item, idx))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  onRowClick: PropTypes.func,
  renderRow: PropTypes.func,
};