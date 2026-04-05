import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Check, ExternalLink } from 'lucide-react';

export default function ActionSuccessBanner({ result }) {
  const navigate = useNavigate();
  if (!result) return null;

  // Support both single link (backward compat) and multiple links (plan results)
  const links = result.links || (result.link ? [{ link: result.link, label: result.linkLabel || 'View' }] : []);

  return (
    <div className="mt-3 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-300">{result.message}</span>
        </div>
        {links.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {links.map((item) => (
              <button
                key={item.link}
                onClick={() => navigate(item.link)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

ActionSuccessBanner.propTypes = {
  result: PropTypes.object,
};
