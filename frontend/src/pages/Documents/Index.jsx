import { useState, useEffect } from 'react';
import { documentsAPI } from '../../api/documents';
import { formatDateTime } from '../../utils/format';
import toast from 'react-hot-toast';
import { Upload, Trash2, FileText, Download, File } from 'lucide-react';
import { Button, Badge, Modal, Select } from '../../components/ui';
import { PageHeader, FilterBar, FormField } from '../../components/common';
import { PageSpinner } from '../../components/ui/Spinner';

const categoryColors = {
  invoice: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  report: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  certificate: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  contract: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  other: 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'other', description: '' });
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => { loadDocuments(); }, []);
  useEffect(() => { loadDocuments(); }, [categoryFilter]);

  async function loadDocuments() {
    setLoading(true);
    try {
      const params = {}; if (categoryFilter) params.category = categoryFilter;
      const { data } = await documentsAPI.list(params);
      setDocuments(data.results || data || []);
    } catch { toast.error('Failed to load documents'); }
    finally { setLoading(false); }
  }

  async function handleUpload(e) {
    e.preventDefault(); if (!file) return toast.error('Please select a file');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file); formData.append('title', form.title || file.name);
      formData.append('category', form.category); formData.append('description', form.description);
      await documentsAPI.upload(formData);
      toast.success('Document uploaded'); setUploadOpen(false); setFile(null);
      setForm({ title: '', category: 'other', description: '' }); loadDocuments();
    } catch { toast.error('Upload failed'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this document?')) return;
    try { await documentsAPI.delete(id); toast.success('Document deleted'); loadDocuments(); }
    catch { toast.error('Delete failed'); }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <PageHeader title="Documents">
        <Button icon={Upload} onClick={() => setUploadOpen(true)}>Upload</Button>
      </PageHeader>

      <FilterBar>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          options={['invoice', 'report', 'certificate', 'contract', 'other'].map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
          placeholder="All Categories" className="w-auto" />
      </FilterBar>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><FileText className="h-6 w-6 text-indigo-500 dark:text-indigo-400" /></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{doc.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(doc.created_at)}</p>
                </div>
              </div>
              <Badge colorMap={categoryColors} value={doc.category}>{doc.category}</Badge>
            </div>
            {doc.description && <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">By: {doc.uploaded_by_name || 'Unknown'}</span>
              <div className="flex gap-1">
                {doc.file_url && <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"><Download className="h-4 w-4" /></a>}
                <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
            <File className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" /><p>No documents uploaded yet</p>
          </div>
        )}
      </div>

      {uploadOpen && (
        <Modal maxWidth="max-w-md">
          <Modal.Header onClose={() => setUploadOpen(false)}>Upload Document</Modal.Header>
          <form onSubmit={handleUpload} className="p-5 space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm text-gray-700 dark:text-gray-300" />
            </div>
            <FormField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Document title (optional)" />
            <div>
              <label htmlFor='category' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="invoice">Invoice</option><option value="report">Report</option><option value="certificate">Certificate</option><option value="contract">Contract</option><option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor='description' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!file} loading={saving}>{saving ? 'Uploading...' : 'Upload'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
