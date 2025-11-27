'use client';

import { useState } from 'react';
import { CreditCard, Check, X, Calendar, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { loadStripe } from '@stripe/stripe-js';
import { Lang } from '@/lib/i18n';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function BillingClient({ user, subscription, lang }: any) {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleChangePlan = async (priceId: string) => {
    setActionLoading('change-plan');
    try {
      const res = await fetch('/api/billing/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Change plan error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
      return;
    }
    setActionLoading('cancel');
    try {
      const res = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'TRIALING':
        return 'success';
      case 'PAST_DUE':
        return 'warning';
      case 'CANCELED':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const isPremium = user.subscriptionTier !== 'FREE';
  const renewalDate = subscription?.currentPeriodEnd;
  const isCanceled = subscription?.cancelAtPeriodEnd || user.subscriptionStatus === 'CANCELED';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            {lang === 'en' 
              ? 'Manage your subscription and billing information'
              : 'Gestiona tu suscripción e información de facturación'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg capitalize">
                {user.subscriptionTier?.toLowerCase().replace('_', ' ') || 'Free'}
              </p>
              <p className="text-sm text-slate-400">
                {lang === 'en' ? 'Status' : 'Estado'}: {user.subscriptionStatus?.toLowerCase() || 'Active'}
              </p>
              {renewalDate && !isCanceled && (
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {lang === 'en' ? 'Renews' : 'Renueva'}: {formatDate(renewalDate)}
                </p>
              )}
              {isCanceled && renewalDate && (
                <p className="text-sm text-orange-400 mt-1 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {lang === 'en' ? 'Cancels' : 'Cancela'}: {formatDate(renewalDate)}
                </p>
              )}
            </div>
            {subscription && (
              <Badge variant={getStatusColor(subscription.status)}>
                {subscription.status}
              </Badge>
            )}
          </div>

          {isPremium && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  const newPriceId = user.subscriptionTier === 'PREMIUM_MONTHLY' 
                    ? 'price_annual' 
                    : 'price_monthly';
                  handleChangePlan(newPriceId);
                }}
                disabled={!!actionLoading}
              >
                {actionLoading === 'change-plan' ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {lang === 'en' 
                  ? `Switch to ${user.subscriptionTier === 'PREMIUM_MONTHLY' ? 'Annual' : 'Monthly'}`
                  : `Cambiar a ${user.subscriptionTier === 'PREMIUM_MONTHLY' ? 'Anual' : 'Mensual'}`}
              </Button>
              {!isCanceled && (
                <Button
                  variant="outline"
                  className="w-full text-red-400 border-red-400/30 hover:bg-red-400/10"
                  onClick={handleCancelSubscription}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'cancel' ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  {lang === 'en' ? 'Cancel Subscription' : 'Cancelar Suscripción'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {!isPremium && (
        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Upgrade to Premium' : 'Actualizar a Premium'}</CardTitle>
            <CardDescription>
              {lang === 'en'
                ? 'Unlock all features with a Premium subscription'
                : 'Desbloquea todas las funciones con una suscripción Premium'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-slate-800">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-2">{lang === 'en' ? 'Monthly' : 'Mensual'}</h3>
                  <p className="text-3xl font-bold mb-4">$29.99<span className="text-sm text-slate-400">/mo</span></p>
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe('price_monthly')}
                    disabled={loading}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {lang === 'en' ? 'Subscribe Monthly' : 'Suscribirse Mensual'}
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-xl">{lang === 'en' ? 'Annual' : 'Anual'}</h3>
                    <Badge variant="success">{lang === 'en' ? 'Best Value' : 'Mejor Valor'}</Badge>
                  </div>
                  <p className="text-3xl font-bold mb-1">$299.99<span className="text-sm text-slate-400">/yr</span></p>
                  <p className="text-xs text-emerald-400 mb-4">{lang === 'en' ? 'Save $60/year' : 'Ahorra $60/año'}</p>
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe('price_annual')}
                    disabled={loading}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {lang === 'en' ? 'Subscribe Annual' : 'Suscribirse Anual'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {subscription?.payments && subscription.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Payment History' : 'Historial de Pagos'}</CardTitle>
            <CardDescription>
              {lang === 'en'
                ? 'View your past invoices and payments'
                : 'Ver tus facturas y pagos anteriores'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subscription.payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900/80 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                      </p>
                      {payment.stripeInvoiceId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => {
                            // Open Stripe invoice in new tab
                            window.open(`https://dashboard.stripe.com/invoices/${payment.stripeInvoiceId}`, '_blank');
                          }}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {formatDate(payment.createdAt)}
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

