import PropTypes from 'prop-types';

export default function PageHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold u-text">{title}</h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};
