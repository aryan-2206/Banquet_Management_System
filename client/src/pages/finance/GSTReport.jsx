import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useFinanceStore from './useFinanceStore';
import { formatINR, computeGST } from './useInstallmentLogic';

const Icon = ({ d, size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const ICONS = {
  back:     'M19 12H5M12 5l-7 7 7 7',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  excel:    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h2M8 17h2M12 13h4M12 17h4',
  filter:   'M22 3H2l8 9.46V19l4 2V12.46L22 3z',
};

const HALLS = ['All Halls', 'Grand Ballroom', 'Crystal Hall', 'Pearl Suite'];
const GST_RATES = ['All Rates', '5%', '12%', '18%'];

function ExportButton({ children, icon, onClick, downloading }) {
  return (
    <button className={`gst-export-btn btn-outline-gold ${downloading ? 'gst-export-btn--loading' : ''}`}
      onClick={onClick} disabled={downloading}>
      {downloading
        ? <><span className="gst-spinner" /><span>Preparing…</span></>
        : <><Icon d={icon} size={15} /> <span>{children}</span></>
      }
    </button>
  );
}

export default function GSTReport() {
  const navigate  = useNavigate();
  const bookings  = useFinanceStore((s) => s.bookings);

  const [fromDate, setFromDate]   = useState('2026-01-01');
  const [toDate, setToDate]       = useState('2026-12-31');
  const [hall, setHall]           = useState('All Halls');
  const [rate, setRate]           = useState('All Rates');
  const [dlExcel, setDlExcel]     = useState(false);
  const [dlPDF, setDlPDF]         = useState(false);

  const rows = useMemo(() => {
    return bookings
      .filter((b) => {
        const d = b.eventDate;
        if (fromDate && d < fromDate) return false;
        if (toDate   && d > toDate)   return false;
        if (hall !== 'All Halls' && b.hall !== hall) return false;
        if (rate !== 'All Rates' && `${b.gstRate}%` !== rate) return false;
        return true;
      })
      .map((b) => {
        const taxable = b.totalValue;
        const gst = computeGST(taxable, b.gstRate, b.isInterstate);
        return { ...b, taxable, ...gst };
      });
  }, [bookings, fromDate, toDate, hall, rate]);

  const totalTaxable = rows.reduce((a, r) => a + r.taxable, 0);
  const totalGST     = rows.reduce((a, r) => a + r.total, 0);
  const totalPayable = totalTaxable + totalGST;

  async function simulateDownload(setLoading) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
  }

  return (
    <div className="gst-root">
      <div className="gst-header">
        <button className="pl-back" onClick={() => navigate('/finance')}>
          <Icon d={ICONS.back} size={16} /> Dashboard
        </button>
        <div>
          <h1 className="ib-title">GST Report</h1>
          <p className="ib-sub">Tax computation and export for all bookings</p>
        </div>
        <div className="gst-exports">
          <ExportButton icon={ICONS.excel} downloading={dlExcel}
            onClick={() => simulateDownload(setDlExcel)}>
            Export Excel
          </ExportButton>
          <ExportButton icon={ICONS.download} downloading={dlPDF}
            onClick={() => simulateDownload(setDlPDF)}>
            Download PDF
          </ExportButton>
        </div>
      </div>

      {/* Filter bar */}
      <div className="gst-filters glass">
        <Icon d={ICONS.filter} size={15} className="gst-filters__icon" />
        <label className="gst-filter-label">From
          <input type="date" className="pem-input gst-date-input" value={fromDate}
            onChange={(e) => setFromDate(e.target.value)} aria-label="From date" />
        </label>
        <label className="gst-filter-label">To
          <input type="date" className="pem-input gst-date-input" value={toDate}
            onChange={(e) => setToDate(e.target.value)} aria-label="To date" />
        </label>
        <label className="gst-filter-label">Hall
          <select className="pem-select" value={hall} onChange={(e) => setHall(e.target.value)} aria-label="Filter by hall">
            {HALLS.map((h) => <option key={h}>{h}</option>)}
          </select>
        </label>
        <label className="gst-filter-label">GST Rate
          <select className="pem-select" value={rate} onChange={(e) => setRate(e.target.value)} aria-label="Filter by GST rate">
            {GST_RATES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <span className="gst-filter-count">{rows.length} records</span>
      </div>

      {/* Summary cards */}
      <div className="gst-summary-cards">
        {[
          { label: 'Taxable Value',     val: totalTaxable, color: '#C9A84C', icon: '₹' },
          { label: 'Total GST Collected', val: totalGST,   color: '#5B8FE8', icon: '%' },
          { label: 'Net Payable',        val: totalPayable, color: '#5FBF8A', icon: '✓' },
        ].map((c, i) => (
          <div key={c.label} className="gst-card glass glass-hover animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="gst-card__icon" style={{ color: c.color, background: `${c.color}18` }}>{c.icon}</div>
            <div>
              <p className="gst-card__label">{c.label}</p>
              <p className="gst-card__val" style={{ color: c.color }}>{formatINR(c.val)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="pl-empty glass">
          <div className="fd-empty__icon">◎</div>
          <h3 className="fd-empty__title">No records match your filters</h3>
          <p className="fd-empty__sub">Adjust the date range or filters above.</p>
        </div>
      ) : (
        <div className="fd-table-wrap">
          <table className="fd-table gst-table">
            <thead>
              <tr className="fd-table__head">
                {['Booking ID','Client','Event Date','Taxable Amt','GST Rate','CGST','SGST','IGST','Total GST','Invoice No.'].map(h => (
                  <th key={h} className="fd-table__th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="fd-table__row animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <td className="fd-table__td fd-table__td--id">{r.id}</td>
                  <td className="fd-table__td">{r.clientName}</td>
                  <td className="fd-table__td">{r.eventDate}</td>
                  <td className="fd-table__td fd-table__td--num">{formatINR(r.taxable)}</td>
                  <td className="fd-table__td">
                    <span className="badge-finance badge-finance--deposit">{r.gstRate}%</span>
                  </td>
                  <td className="fd-table__td fd-table__td--num">{r.cgst ? formatINR(r.cgst) : '—'}</td>
                  <td className="fd-table__td fd-table__td--num">{r.sgst ? formatINR(r.sgst) : '—'}</td>
                  <td className="fd-table__td fd-table__td--num">{r.igst ? formatINR(r.igst) : '—'}</td>
                  <td className="fd-table__td fd-table__td--num" style={{ color: '#5B8FE8' }}>{formatINR(r.total)}</td>
                  <td className="fd-table__td">
                    <code className="pl-utr">{r.invoiceNo}</code>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="gst-table__foot">
                <td colSpan={3} className="fd-table__th">Totals ({rows.length} records)</td>
                <td className="fd-table__th fd-table__td--num">{formatINR(totalTaxable)}</td>
                <td />
                <td className="fd-table__th fd-table__td--num">{formatINR(rows.reduce((a,r)=>a+r.cgst,0))}</td>
                <td className="fd-table__th fd-table__td--num">{formatINR(rows.reduce((a,r)=>a+r.sgst,0))}</td>
                <td className="fd-table__th fd-table__td--num">{formatINR(rows.reduce((a,r)=>a+r.igst,0))}</td>
                <td className="fd-table__th fd-table__td--num" style={{ color: '#5B8FE8' }}>{formatINR(totalGST)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
