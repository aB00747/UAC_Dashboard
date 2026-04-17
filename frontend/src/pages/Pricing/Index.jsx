import { useState, useEffect } from 'react';
import { chemicalsAPI } from '../../api/inventory';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { PageHeader, SearchInput } from '../../components/common';
import { PageSpinner } from '../../components/ui/Spinner';

export default function Pricing() {
  const [chemicals, setChemicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [edited, setEdited] = useState({});

  useEffect(() => {
    chemicalsAPI.list({ page_size: 200 }).then(({ data }) => {
      setChemicals(data.results || data || []);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load chemicals');
      setLoading(false);
    });
  }, []);

  function handleChange(id, field, value) {
    setEdited((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  async function handleSave(chem) {
    const changes = edited[chem.id];
    if (!changes) return;
    try {
      await chemicalsAPI.update(chem.id, { ...chem, ...changes });
      toast.success(`${chem.chemical_name} updated`);
      setChemicals((prev) =>
        prev.map((c) => (c.id === chem.id ? { ...c, ...changes } : c))
      );
      setEdited((prev) => {
        const next = { ...prev };
        delete next[chem.id];
        return next;
      });
    } catch { toast.error('Update failed'); }
  }

  const filtered = chemicals.filter(
    (c) =>
      c.chemical_name.toLowerCase().includes(search.toLowerCase()) ||
      c.chemical_code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <PageHeader title="Pricing Management" />

      <div className="u-card p-4">
        <SearchInput placeholder="Search chemicals..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
      </div>

      <div className="u-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="u-bg-subtle border-b u-border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium u-text-3">Chemical</th>
              <th className="text-left py-3 px-4 font-medium u-text-3">Code</th>
              <th className="text-right py-3 px-4 font-medium u-text-3">Purchase Price</th>
              <th className="text-right py-3 px-4 font-medium u-text-3">Selling Price</th>
              <th className="text-right py-3 px-4 font-medium u-text-3">GST %</th>
              <th className="text-right py-3 px-4 font-medium u-text-3">Margin</th>
              <th className="text-right py-3 px-4 font-medium u-text-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const e = edited[c.id] || {};
              const pp = Number.parseFloat(e.purchase_price ?? c.purchase_price) || 0;
              const sp = Number.parseFloat(e.selling_price ?? c.selling_price) || 0;
              const margin = pp > 0 ? (((sp - pp) / pp) * 100).toFixed(1) : '-';
              const isEdited = !!edited[c.id];
              const marginColor = (m) => {
                if (m > 0) return 'text-green-500';
                if (m < 0) return 'text-red-500';
                return 'u-text-3';
              };

              return (
                <tr key={c.id} className="border-b u-border-b hover:u-bg-subtle">
                  <td className="py-3 px-4 font-medium u-text">{c.chemical_name}</td>
                  <td className="py-3 px-4 u-text-2">{c.chemical_code}</td>
                  <td className="py-3 px-4 text-right">
                    <input type="number" step="any"
                      className="u-input w-28 px-2 py-1 rounded text-sm text-right"
                      value={e.purchase_price ?? c.purchase_price}
                      onChange={(ev) => handleChange(c.id, 'purchase_price', ev.target.value)} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <input type="number" step="any"
                      className="u-input w-28 px-2 py-1 rounded text-sm text-right"
                      value={e.selling_price ?? c.selling_price}
                      onChange={(ev) => handleChange(c.id, 'selling_price', ev.target.value)} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <input type="number" step="any"
                      className="u-input w-20 px-2 py-1 rounded text-sm text-right"
                      value={e.gst_percentage ?? c.gst_percentage}
                      onChange={(ev) => handleChange(c.id, 'gst_percentage', ev.target.value)} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${marginColor(Number.parseFloat(margin))}`}>
                      {margin === '-' ? '-' : `${margin}%`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEdited && (
                      <button onClick={() => handleSave(c)} className="p-1.5 u-text-brand hover:u-bg-brand-light rounded">
                        <Save className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-10 text-center u-text-3">No chemicals found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
