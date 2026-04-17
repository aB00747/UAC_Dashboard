import { useState, useEffect } from 'react';
import { messagesAPI } from '../../api/messaging';
import { formatDateTime, classNames } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Send, Mail, MailOpen } from 'lucide-react';
import { Button, Modal } from '../../components/ui';
import { PageHeader, FormField } from '../../components/common';
import { PageSpinner } from '../../components/ui/Spinner';
import client from '../../api/client';

export default function Messaging() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState({ recipient: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => { loadMessages(); }, []);

  async function loadMessages() {
    setLoading(true);
    try {
      const { data } = await messagesAPI.list();
      setMessages(data.results || data || []);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoading(false); }
  }

  async function viewMessage(msg) {
    try {
      const { data } = await messagesAPI.get(msg.id);
      setSelected(data);
      if (!msg.is_read && msg.recipient === user?.id) {
        await messagesAPI.markRead(msg.id);
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
      }
    } catch { toast.error('Failed to load message'); }
  }

  async function openCompose() {
    try { await client.get('/auth/me/'); } catch { /* ignore */ }
    setForm({ recipient: '', subject: '', body: '' });
    setComposeOpen(true);
  }

  async function handleSend(e) {
    e.preventDefault();
    setSending(true);
    try {
      await messagesAPI.create(form);
      toast.success('Message sent');
      setComposeOpen(false);
      loadMessages();
    } catch { toast.error('Send failed'); }
    finally { setSending(false); }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <PageHeader title="Messaging">
        <Button icon={Plus} onClick={openCompose}>Compose</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Message list */}
        <div className="lg:col-span-1 u-card overflow-hidden">
          <div className="p-3 border-b u-border-b">
            <h3 className="text-sm font-semibold u-text">Inbox</h3>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
            {messages.length === 0 ? (
              <p className="p-6 text-sm u-text-3 text-center">No messages</p>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => viewMessage(msg)}
                  className={classNames(
                    'w-full text-left px-4 py-3 hover:u-bg-subtle transition-colors',
                    selected?.id === msg.id && 'u-bg-brand-light',
                    !msg.is_read && 'bg-blue-50/50 dark:bg-blue-900/20'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {msg.is_read ? <MailOpen className="h-4 w-4 u-text-3" /> : <Mail className="h-4 w-4 u-text-brand" />}
                    <span className={classNames('text-sm', msg.is_read ? 'u-text-2' : 'font-semibold u-text')}>
                      {msg.sender_name || `User #${msg.sender}`}
                    </span>
                  </div>
                  <p className="text-sm font-medium u-text mt-1 truncate">{msg.subject}</p>
                  <p className="text-xs u-text-3 mt-0.5">{formatDateTime(msg.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message detail */}
        <div className="lg:col-span-2 u-card">
          {selected ? (
            <div>
              <div className="p-5 border-b u-border-b">
                <h3 className="text-lg font-semibold u-text">{selected.subject}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm u-text-3">
                  <span>From: <span className="font-medium u-text-2">{selected.sender_name || `User #${selected.sender}`}</span></span>
                  <span>To: <span className="font-medium u-text-2">{selected.recipient_name || `User #${selected.recipient}`}</span></span>
                  <span>{formatDateTime(selected.created_at)}</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm u-text-2 whitespace-pre-wrap">{selected.body}</p>
              </div>
              {selected.replies && selected.replies.length > 0 && (
                <div className="px-5 pb-5 space-y-3">
                  <h4 className="text-sm font-semibold u-text">Replies</h4>
                  {selected.replies.map((r) => (
                    <div key={r.id} className="p-3 u-bg-subtle rounded-lg text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium u-text">{r.sender_name}</span>
                        <span className="text-xs u-text-3">{formatDateTime(r.created_at)}</span>
                      </div>
                      <p className="u-text-2">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 u-text-3 text-sm">
              Select a message to read
            </div>
          )}
        </div>
      </div>

      {composeOpen && (
        <Modal maxWidth="max-w-lg">
          <Modal.Header onClose={() => setComposeOpen(false)}>New Message</Modal.Header>
          <form onSubmit={handleSend} className="p-5 space-y-4">
            <FormField label="Recipient User ID *" type="number" required value={form.recipient}
              onChange={(v) => setForm({ ...form, recipient: v })} placeholder="Enter user ID" />
            <FormField label="Subject *" required value={form.subject}
              onChange={(v) => setForm({ ...form, subject: v })} />
            <div>
              <label htmlFor='message' className="block text-sm font-medium u-text-2 mb-1">Message *</label>
              <textarea required rows={5}
                className="u-input w-full px-3 py-2 rounded-lg text-sm"
                value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setComposeOpen(false)}>Cancel</Button>
              <Button type="submit" icon={Send} disabled={sending} loading={sending}>
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
