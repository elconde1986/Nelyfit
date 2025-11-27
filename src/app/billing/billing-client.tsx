'use client';

import { useState } from 'react';
import { CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { loadStripe } from '@stripe/stripe-js';
import { Lang } from '@/lib/i18n';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function BillingClient({ user, subscription, lang }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      
      if (data.success && data.clientSecret) {
        const stripe = await stripePromise;
        if (stripe) {
          await stripe.confirmCardPayment(data.clientSecret);
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg capitalize">
                {user.subscriptionTier?.toLowerCase().replace('_', ' ') || 'Free'}
              </p>
              <p className="text-sm text-slate-400">
                Status: {user.subscriptionStatus?.toLowerCase() || 'Active'}
              </p>
            </div>
            {subscription && (
              <Badge variant={subscription.status === 'ACTIVE' ? 'success' : 'default'}>
                {subscription.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade to Premium</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-slate-800">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-2">Monthly</h3>
                <p className="text-3xl font-bold mb-4">$29.99<span className="text-sm text-slate-400">/mo</span></p>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe('price_monthly')}
                  disabled={loading}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Subscribe Monthly
                </Button>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-xl">Annual</h3>
                  <Badge variant="success">Best Value</Badge>
                </div>
                <p className="text-3xl font-bold mb-1">$299.99<span className="text-sm text-slate-400">/yr</span></p>
                <p className="text-xs text-emerald-400 mb-4">Save $60/year</p>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe('price_annual')}
                  disabled={loading}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Subscribe Annual
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {subscription?.payments && subscription.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subscription.payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60"
                >
                  <div>
                    <p className="font-semibold">
                      ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      payment.status === 'SUCCEEDED'
                        ? 'success'
                        : payment.status === 'FAILED'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

