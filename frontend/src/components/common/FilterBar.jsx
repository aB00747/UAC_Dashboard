import PropTypes from "prop-types";

export default function FilterBar({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  );
}

FilterBar.propTypes = {
  children: PropTypes.node
};