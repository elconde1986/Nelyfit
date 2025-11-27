'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createTemporaryCodeAction } from './actions';

export default function CreateCodeClient({ adminId }: { adminId: string }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'TRIAL_CODE' as 'TRIAL_CODE' | 'COACH_INVITE' | 'CORPORATE_WELLNESS',
    expiresInDays: 30,
    maxUses: 1,
    trialDays: 7,
    assignedTier: 'PREMIUM_MONTHLY' as 'FREE' | 'PREMIUM_MONTHLY' | 'PREMIUM_ANNUAL',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.expiresInDays);
      
      const code = await createTemporaryCodeAction({
        ...formData,
        expiresAt,
        createdById: adminId,
      });
      
      alert(`Code created: ${code}`);
      window.location.reload();
    } catch (error) {
      alert('Failed to create code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Code</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-50 text-sm"
            >
              <option value="TRIAL_CODE">Trial Code</option>
              <option value="COACH_INVITE">Coach Invite</option>
              <option value="CORPORATE_WELLNESS">Corporate Wellness</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Expires In (days)</label>
            <input
              type="number"
              min="1"
              value={formData.expiresInDays}
              onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-50 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Max Uses</label>
            <input
              type="number"
              min="1"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-50 text-sm"
            />
          </div>
          {formData.type === 'TRIAL_CODE' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Trial Days</label>
              <input
                type="number"
                min="1"
                value={formData.trialDays}
                onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-50 text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Assigned Tier</label>
            <select
              value={formData.assignedTier}
              onChange={(e) => setFormData({ ...formData, assignedTier: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-50 text-sm"
            >
              <option value="FREE">Free</option>
              <option value="PREMIUM_MONTHLY">Premium Monthly</option>
              <option value="PREMIUM_ANNUAL">Premium Annual</option>
            </select>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create Code'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

