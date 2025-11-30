import React, { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import api from '../api/axios'

const Cohorts = () => {
  const [cohorts, setCohorts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/metrics/cohorts?days=90')
        setCohorts(data.cohorts || [])
      } catch (err) {
        console.error(err)
        // show clearer guidance when access is forbidden
        if (err?.response?.status === 403) {
          alert('Access denied: this endpoint requires admin access. Log in as an admin or use an API key with the "read:metrics" or "admin" scope.')
        } else if (err?.response?.status === 401) {
          alert('Not authorized: please sign in to view cohort data.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page container p-6">
      <PageHeader title="Cohort Table" subtitle="Detailed cohort analysis." />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card">
          {cohorts.length === 0 ? (
            <div className="text-gray-600">No cohort data available. Try running the server seeder or click to view DB counts.</div>
          ) : (
            <ul className="space-y-3">
              {cohorts.map(c => (
                <li key={c.cohortDay} className="p-3 border rounded">
                  <div className="flex justify-between">
                    <div className="font-medium">{c.cohortDay} (size: {c.size})</div>
                    <div className="text-sm text-gray-500">Day0: {c.day_0}% — Day7: {c.day_7}% — Day30: {c.day_30}%</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {(!loading && cohorts.length === 0) && (
        <div style={{ marginTop: 10 }}>
          <button className="btn-accent" onClick={async () => {
            try {
              const { data } = await api.get('/debug/stats')
              alert(`DB counts:\nusers: ${data.users}\nevents: ${data.events}\napikeys: ${data.apikeys}`)
            } catch (err) {
              alert('Failed to fetch debug stats')
            }
          }}>Show DB counts</button>
        </div>
      )}
    </div>
  )
}

export default Cohorts
