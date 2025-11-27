'use client';

import { useState, useEffect } from 'react';
import { Scale, Plus, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function WeightLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLog, setNewLog] = useState({ date: new Date().toISOString().split('T')[0], weight: '', unit: 'kg', note: '' });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/tracking/weight-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tracking/weight-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewLog({ date: new Date().toISOString().split('T')[0], weight: '', unit: 'kg', note: '' });
        fetchLogs();
      }
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestWeight = sortedLogs[0]?.weight;
  const previousWeight = sortedLogs[1]?.weight;
  const trend = latestWeight && previousWeight ? (latestWeight > previousWeight ? 'up' : latestWeight < previousWeight ? 'down' : 'same') : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Weight Tracking</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Track your body weight over time</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </header>

        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Weight Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Date</label>
                    <Input
                      type="date"
                      value={newLog.date}
                      onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Unit</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
                      value={newLog.unit}
                      onChange={(e) => setNewLog({ ...newLog, unit: e.target.value })}
                    >
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Weight</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newLog.weight}
                    onChange={(e) => setNewLog({ ...newLog, weight: e.target.value })}
                    placeholder="Enter weight"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Note (optional)</label>
                  <Input
                    value={newLog.note}
                    onChange={(e) => setNewLog({ ...newLog, note: e.target.value })}
                    placeholder="e.g., morning weight, after workout"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {latestWeight && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">Current Weight</p>
                <p className="text-3xl font-bold">{latestWeight} {sortedLogs[0]?.unit}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">Total Entries</p>
                <p className="text-3xl font-bold">{logs.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">Trend</p>
                <div className="flex items-center gap-2">
                  {trend === 'up' && <TrendingUp className="w-6 h-6 text-red-400" />}
                  {trend === 'down' && <TrendingUp className="w-6 h-6 text-emerald-400 rotate-180" />}
                  {trend === 'same' && <Scale className="w-6 h-6 text-slate-400" />}
                  <p className="text-xl font-bold">
                    {trend === 'up' ? '+' : trend === 'down' ? '-' : '='}
                    {trend && Math.abs(latestWeight - previousWeight).toFixed(1)} {sortedLogs[0]?.unit}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Weight History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-slate-400 py-8">Loading...</p>
            ) : sortedLogs.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No weight entries yet. Add your first entry to start tracking!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="font-semibold">{log.weight} {log.unit}</p>
                        <p className="text-sm text-slate-400">
                          {new Date(log.date).toLocaleDateString()}
                          {log.note && ` • ${log.note}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
