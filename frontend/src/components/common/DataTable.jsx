import PropTypes from 'prop-types';
import { InlineSpinner } from '../ui/Spinner';

export default function DataTable({ columns, data, loading, emptyMessage = 'No data found', onRowClick, renderRow }) {
  return (
    <div className="u-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="u-table-header u-border-b">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  className={`py-3 px-4 font-medium ${col.align === 'right' ? 'text-right' : 'text-left'}`}
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
                <td colSpan={columns.length} className="py-10 text-center u-text-3">
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
