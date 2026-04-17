import PropTypes from "prop-types";

export default function FilterBar({ children }) {
  return (
    <div className="u-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  );
}

FilterBar.propTypes = {
  children: PropTypes.node
};
