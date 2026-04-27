import { useState, useEffect, useRef } from 'react';
import { Clock, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { auditLogsAPI } from '../../api/auditLogs';
import { relativeTime } from '../../utils/invoiceUtils';

const ACTION_BADGE = {
  created:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  updated:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  deleted:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  downloaded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  finalised:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  login:      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  logout:     'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  login_failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function badgeClass(action) {
  for (const [key, cls] of Object.entries(ACTION_BADGE)) {
    if (action.includes(key)) return cls;
  }
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
}

export function AuditLogDrawer({ module }) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  async function fetchLogs() {
    setLoading(true);
    try {
      const { data } = await auditLogsAPI.list({ module, page_size: 20 });
      setLogs(data.results || data || []);
    } catch {
      // silently ignore — drawer is non-critical
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) {
      clearInterval(timerRef.current);
      return;
    }
    fetchLogs();
    timerRef.current = setInterval(fetchLogs, 30_000);
    return () => clearInterval(timerRef.current);
  }, [open, module]);

  const lastLog = logs[0];

  return (
    <div
      className="sticky bottom-0 left-0 right-0 mt-4 rounded-t-lg border"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      {/* Collapsed strip */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full px-4 py-2 text-xs u-text-3 hover:u-text transition-colors"
      >
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span className="font-semibold capitalize">{module} activity</span>
        {lastLog && !open && (
          <span className="ml-1 truncate">
            ·&nbsp;
            <span className={`px-1.5 py-0.5 rounded font-medium ${badgeClass(lastLog.action)}`}>
              {lastLog.action}
            </span>
            &nbsp;{lastLog.object_repr}&nbsp;·&nbsp;{relativeTime(lastLog.timestamp)}
          </span>
        )}
        <span className="ml-auto shrink-0">
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </span>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="max-h-52 overflow-y-auto px-4 py-2 space-y-2">
            {loading && logs.length === 0 && (
              <p className="text-xs u-text-3 text-center py-6">Loading…</p>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-2 text-xs py-0.5">
                <span className={`shrink-0 px-1.5 py-0.5 rounded font-medium ${badgeClass(log.action)}`}>
                  {log.action}
                </span>
                <span className="u-text flex-1 truncate">{log.object_repr}</span>
                <span className="u-text-3 shrink-0">{log.user_name || 'System'}</span>
                <span className="u-text-3 shrink-0">{relativeTime(log.timestamp)}</span>
              </div>
            ))}
            {!loading && logs.length === 0 && (
              <p className="text-xs u-text-3 text-center py-6">No recent activity</p>
            )}
          </div>
          <div className="px-4 py-1.5 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
            <a href="/settings?tab=audit" className="text-xs u-text-brand flex items-center gap-1 hover:underline">
              View all logs <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
