import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Check, ExternalLink } from 'lucide-react';
import './ActionSuccessBanner.css';

export default function ActionSuccessBanner({ result }) {
  const navigate = useNavigate();
  if (!result) return null;

  const links = result.links || (result.link ? [{ link: result.link, label: result.linkLabel || 'View' }] : []);

  return (
    <div className="success-banner">
      <div className="success-banner__content">
        <div className="success-banner__message">
          <Check className="success-banner__icon" />
          <span className="success-banner__text">{result.message}</span>
        </div>
        {links.length > 0 && (
          <div className="success-banner__links">
            {links.map((item) => (
              <button
                key={item.link}
                onClick={() => navigate(item.link)}
                className="success-banner__link-btn"
              >
                <ExternalLink className="success-banner__link-icon" />
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
