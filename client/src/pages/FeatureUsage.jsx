import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import PageHeader from '../components/PageHeader'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const FeatureUsage = () => {
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/metrics/feature-usage')
        setFeatures(data.features || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page container p-6">
      <PageHeader title="Feature Usage" subtitle="Top used features across all users." />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card" style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={features} layout="vertical" margin={{ top: 20, right: 20, left: 40, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="eventType" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="total" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default FeatureUsage
