/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GestureHistoryItem } from '../types/gestures';
import { Trash2, Download, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { GESTURE_DEFINITIONS } from '../utils/gestureDefinitions';
import { AppTheme } from '../types/theme';
import { get3DGestureImage } from '../utils/gesture3DMap';

interface GestureHistoryProps {
  history: GestureHistoryItem[];
  onClearHistory: () => void;
  onDeleteItem?: (id: string) => void;
  onDeleteItems?: (ids: string[]) => void;
  theme?: AppTheme;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const GestureHistory: React.FC<GestureHistoryProps> = ({
  history,
  onClearHistory,
  onDeleteItem,
  onDeleteItems,
  theme = 'black',
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailItem, setDetailItem] = useState<GestureHistoryItem | null>(null);

  const isDark = theme === 'black';

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const pageBg      = isDark ? '#0c0c0e' : '#ffffff';
  const tableBorder = isDark ? '#1f1f1f' : '#e5e7eb';
  const headerBg    = isDark ? '#111113' : '#f9fafb';
  const rowHover    = isDark ? '#141416' : '#f9fafb';
  const textMain    = isDark ? '#ffffff' : '#111827';
  const textMuted   = isDark ? '#6b7280' : '#6b7280';
  const inputBg     = isDark ? '#141416' : '#ffffff';
  const inputBorder = isDark ? '#2a2a2a' : '#d1d5db';
  const divider     = isDark ? '#1a1a1c' : '#f3f4f6';

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!filterQuery.trim()) return history;
    const q = filterQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.gesture.toLowerCase().includes(q) ||
        item.handedness.toLowerCase().includes(q) ||
        item.timestamp.toLowerCase().includes(q) ||
        item.extendedFingers.toLowerCase().includes(q)
    );
  }, [history, filterQuery]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(currentPage, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleFilterChange = (v: string) => {
    setFilterQuery(v);
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    if (onDeleteItem) onDeleteItem(id);
    else if (onDeleteItems) onDeleteItems([id]);
  };

  const handleExport = () => {
    if (history.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `gesture-history-${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ── Detail modal ──────────────────────────────────────────────────────────
  const DetailModal = () => {
    if (!detailItem) return null;
    const def = GESTURE_DEFINITIONS.find((d) => d.id === detailItem.gesture);
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}
        onClick={() => setDetailItem(null)}
      >
        <div
          style={{
            backgroundColor: isDark ? '#141416' : '#ffffff',
            border: `1px solid ${tableBorder}`,
            borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px',
              backgroundColor: isDark ? '#1a1a24' : '#f1f5f9',
              border: `1.5px solid ${tableBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '4px', overflow: 'hidden', flexShrink: 0,
            }}>
              <img
                src={get3DGestureImage(detailItem.gesture)}
                alt={detailItem.gesture}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: textMain }}>{detailItem.gesture}</div>
              <div style={{ fontSize: '12px', color: textMuted }}>{detailItem.handedness} hand · {detailItem.timestamp}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            {[
              ['Confidence', `${Math.round(detailItem.confidence * 100)}%`],
              ['Extended Fingers', detailItem.extendedFingers],
              ['Handedness', detailItem.handedness],
              ['Timestamp', detailItem.timestamp],
              ['Gesture Summary', def?.summary || '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${divider}`, paddingBottom: '8px' }}>
                <span style={{ color: textMuted, minWidth: '130px', fontWeight: 600 }}>{label}</span>
                <span style={{ color: textMain, flex: 1 }}>{value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setDetailItem(null)}
            style={{
              marginTop: '20px', width: '100%', padding: '10px', borderRadius: '10px',
              border: `1px solid ${tableBorder}`, backgroundColor: isDark ? '#1f1f22' : '#f3f4f6',
              color: textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <DetailModal />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

        {/* ── Toolbar row ─────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '12px', marginBottom: '14px', flexWrap: 'wrap',
        }}>
          {/* Filter input */}
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => handleFilterChange(e.target.value)}
            placeholder="Filter"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: `1px solid ${inputBorder}`,
              backgroundColor: inputBg,
              color: textMain,
              fontSize: '13px',
              outline: 'none',
              width: '200px',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = inputBorder; }}
          />

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={history.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '8px',
              backgroundColor: '#4f46e5', color: '#ffffff',
              border: 'none', fontSize: '13px', fontWeight: 700,
              cursor: history.length === 0 ? 'not-allowed' : 'pointer',
              opacity: history.length === 0 ? 0.5 : 1,
              boxShadow: '0 2px 8px #4f46e544',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { if (history.length > 0) e.currentTarget.style.backgroundColor = '#4338ca'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4f46e5'; }}
          >
            <Download size={14} />
            Export JSON
          </button>
        </div>

        {/* ── Table card ──────────────────────────────────────────────────── */}
        <div style={{
          backgroundColor: pageBg,
          border: `1px solid ${tableBorder}`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              {/* Head */}
              <thead>
                <tr style={{ backgroundColor: headerBg, borderBottom: `1px solid ${tableBorder}` }}>
                  {['ID', 'Title', 'Description', 'Created at', 'Updated at', 'Actions'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: '12px', fontWeight: 700,
                        color: textMuted, whiteSpace: 'nowrap',
                        letterSpacing: '0.03em',
                        borderRight: col !== 'Actions' ? `1px solid ${divider}` : 'none',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ padding: '48px 16px', textAlign: 'center', color: textMuted, fontSize: '13px' }}
                    >
                      {filterQuery
                        ? `No results for "${filterQuery}"`
                        : 'No gesture history yet. Start the camera to begin recording.'}
                    </td>
                  </tr>
                ) : (
                  pageItems.map((item, idx) => {
                    const def = GESTURE_DEFINITIONS.find((d) => d.id === item.gesture);
                    const globalIdx = (safePage - 1) * pageSize + idx + 1;
                    const confPct = Math.round(item.confidence * 100);

                    // Format timestamp to match reference: "12/15/23, 7:03 PM"
                    const dateObj = new Date(item.timeMs);
                    const createdAt = dateObj.toLocaleDateString('en-US', {
                      month: '2-digit', day: '2-digit', year: '2-digit',
                    }) + ', ' + dateObj.toLocaleTimeString('en-US', {
                      hour: 'numeric', minute: '2-digit', hour12: true,
                    });

                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: `1px solid ${divider}`,
                          transition: 'background-color 0.1s',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = rowHover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {/* ID */}
                        <td style={{ padding: '12px 16px', color: textMuted, fontWeight: 600, whiteSpace: 'nowrap', borderRight: `1px solid ${divider}` }}>
                          {globalIdx}
                        </td>

                        {/* Title = Gesture name + 3D picture */}
                        <td style={{ padding: '12px 16px', borderRight: `1px solid ${divider}`, whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '8px',
                              backgroundColor: isDark ? '#1a1a24' : '#f1f5f9',
                              border: `1px solid ${tableBorder}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              padding: '2px', overflow: 'hidden', flexShrink: 0,
                            }}>
                              <img
                                src={get3DGestureImage(item.gesture)}
                                alt={item.gesture}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            </div>
                            <span style={{ fontWeight: 600, color: textMain }}>{item.gesture}</span>
                          </div>
                        </td>

                        {/* Description = handedness + extended fingers */}
                        <td style={{ padding: '12px 16px', borderRight: `1px solid ${divider}`, color: textMuted, maxWidth: '220px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.handedness} hand · Fingers: {item.extendedFingers}
                          </div>
                        </td>

                        {/* Created at */}
                        <td style={{ padding: '12px 16px', borderRight: `1px solid ${divider}`, color: textMuted, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '12px' }}>
                          {createdAt}
                        </td>

                        {/* Updated at = confidence score */}
                        <td style={{ padding: '12px 16px', borderRight: `1px solid ${divider}`, whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '12px', fontWeight: 700, fontFamily: 'monospace',
                            padding: '3px 9px', borderRadius: '999px',
                            backgroundColor: confPct >= 85 ? '#16a34a22' : '#d9770622',
                            border: `1px solid ${confPct >= 85 ? '#4ade8044' : '#fbbf2444'}`,
                            color: confPct >= 85 ? '#86efac' : '#fde68a',
                          }}>
                            {confPct}% conf.
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => handleDelete(item.id)}
                              title="Delete"
                              style={{
                                padding: '5px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                                border: '1px solid #f4728088', backgroundColor: 'transparent',
                                color: '#f47280', cursor: 'pointer', transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4728020'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDetailItem(item)}
                              title="View details"
                              style={{
                                padding: '5px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                                border: '1px solid #4f46e588', backgroundColor: 'transparent',
                                color: '#4f46e5', cursor: 'pointer', transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4f46e520'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination footer ─────────────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px',
            padding: '12px 16px',
            borderTop: `1px solid ${tableBorder}`,
            backgroundColor: headerBg,
            flexWrap: 'wrap',
          }}>
            {/* Items per page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: textMuted }}>
              <span style={{ whiteSpace: 'nowrap' }}>Items per page</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                style={{
                  padding: '4px 8px', borderRadius: '6px',
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg, color: textMain,
                  fontSize: '12px', cursor: 'pointer', outline: 'none',
                }}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Page count */}
            <span style={{ fontSize: '12px', color: textMuted, whiteSpace: 'nowrap' }}>
              {filtered.length === 0
                ? '0 of 0'
                : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length}`}
            </span>

            {/* Prev / Next */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  border: `1px solid ${inputBorder}`, backgroundColor: inputBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                  color: safePage <= 1 ? textMuted : textMain,
                  opacity: safePage <= 1 ? 0.4 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  border: `1px solid ${inputBorder}`, backgroundColor: inputBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                  color: safePage >= totalPages ? textMuted : textMain,
                  opacity: safePage >= totalPages ? 0.4 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
