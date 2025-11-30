import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const KpiCard = ({ label, value, hint }) => (
  <div className="kpi-card">
    <div className="label small muted">{label}</div>
    <div style={{ marginTop: 8 }} className="flex items-baseline justify-between">
      <div className="value">{value}</div>
      {hint && <div className="small muted">{hint}</div>}
    </div>
  </div>
);

const Overview = () => {
  const [dauSeries, setDauSeries] = useState([]);
  const [mau, setMau] = useState(0);
  const [stickiness, setStickiness] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [{ data: dauData }, { data: mauData }, { data: stickData }] = await Promise.all([
        api.get('/metrics/dau?days=30'),
        api.get('/metrics/mau?months=1'),
        api.get('/metrics/stickiness'),
      ]);

      setDauSeries(dauData.data || []);
      setMau(mauData.mau ?? 0);
      setStickiness(Math.round((stickData.stickiness ?? 0) * 10000) / 100);
    } catch (err) {
      // Better error logging for auth failures
      if (err?.response) {
        console.error(`Failed to load metrics - status ${err.response.status}:`, err.response.data || err.message);
      } else {
        console.error('Failed to load metrics', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="header-subtitle">Welcome to your analytics hub</p>
          </div>
        </div>

        <section className="kpi-section">
          <div className="kpi-grid-new">
            <div className="kpi-card-new">
              <div className="kpi-icon mau-icon">👥</div>
              <div className="kpi-content">
                <p className="kpi-label">Monthly Active Users</p>
                <h3 className="kpi-value">{loading ? '...' : mau}</h3>
                <span className="kpi-hint">Last 30 days</span>
              </div>
            </div>

            <div className="kpi-card-new">
              <div className="kpi-icon dau-icon">📊</div>
              <div className="kpi-content">
                <p className="kpi-label">Avg Daily Active Users</p>
                <h3 className="kpi-value">{loading ? '...' : (dauSeries.length ? Math.round(dauSeries.reduce((s,r)=>s+r.count,0)/dauSeries.length) : 0)}</h3>
                <span className="kpi-hint">30-day average</span>
              </div>
            </div>

            <div className="kpi-card-new">
              <div className="kpi-icon stickiness-icon">🎯</div>
              <div className="kpi-content">
                <p className="kpi-label">Stickiness Ratio</p>
                <h3 className="kpi-value">{loading ? '...' : `${stickiness}%`}</h3>
                <span className="kpi-hint">DAU / MAU ratio</span>
              </div>
            </div>
          </div>
        </section>

        <section className="chart-section">
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h2>Daily Active Users Trend</h2>
                <p className="chart-subtitle">User activity over the last 30 days</p>
              </div>
            </div>
            <div className="chart-container">
              {loading ? (
                <div className="loading-state">Loading chart data...</div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={dauSeries} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15,17,19,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#FF6D00"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Overview;
