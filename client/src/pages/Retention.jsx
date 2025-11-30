import React, { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import api from '../api/axios'

const Retention = () => {
  const [cohorts, setCohorts] = useState([])
  const [days, setDays] = useState([0,1,7,30])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/metrics/cohorts?days=90')
        setCohorts(data.cohorts || [])
        setDays(data.retentionDays || [0,1,7,30])
      } catch (err) {
        console.error(err)
        if (err?.response?.status === 403) {
          alert('Access denied: this endpoint requires admin access. Log in as admin or use an API key with the "read:metrics" or "admin" scope.')
        } else if (err?.response?.status === 401) {
          alert('Not authorized: please sign in to view retention data.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page container p-6">
      <PageHeader title="Cohort Retention" subtitle="Shows Day-0/1/7/30 retention for cohorts." />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto card">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Cohort Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Size</th>
                {days.map(d => (
                  <th key={d} className="px-6 py-3 text-left text-xs font-medium text-gray-500">Day {d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cohorts.length ? cohorts.map(row => (
                <tr key={row.cohortDay}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.cohortDay}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.size}</td>
                  {days.map(d => (
                    <td key={d} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row[`day_${d}`]}%</td>
                  ))}
                </tr>
              )) : (
                <tr><td className="p-6">No cohort data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {(!loading && cohorts.length === 0) && (
        <div className="mt-4 small muted">
          No cohort data available for the selected window. You can seed demo data by running the server-side seeder, or click below to view DB counts.
          <div style={{ marginTop: 8 }}>
            <button className="btn-accent" onClick={async () => {
              try {
                const { data } = await api.get('/debug/stats')
                alert(`DB counts:\nusers: ${data.users}\nevents: ${data.events}\napikeys: ${data.apikeys}`)
              } catch (err) {
                alert('Failed to fetch debug stats')
              }
            }}>Show DB counts</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Retention
