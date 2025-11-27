'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Lock, ArrowLeft, LogIn, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginCoach } from './actions';

export default function CoachLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4 shadow-2xl shadow-emerald-500/30 relative">
            <User className="w-10 h-10 text-white" strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-yellow-900" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Coach Login
            </span>
          </h1>
          <p className="text-slate-400">Sign in to manage your clients and programs</p>
        </div>

        <Card className="border-emerald-500/30 shadow-xl shadow-emerald-500/10">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={async (formData: FormData) => {
              setIsPending(true);
              setError(null);
              try {
                const result = await loginCoach(formData);
                if (result?.error) {
                  setError(result.error);
                  setIsPending(false);
                }
              } catch (err) {
                setError('An error occurred. Please try again.');
                setIsPending(false);
              }
            }} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/50 px-4 py-3 text-sm text-red-400 animate-fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue="coach@nelyfit.demo"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="coach@nelyfit.demo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    defaultValue="demo"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isPending} size="lg">
                {isPending ? (
                  'Logging in...'
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-xs text-center text-slate-500 mb-3">
                Demo credentials:
              </p>
              <div className="text-xs text-center space-y-1 text-slate-400">
                <p>Email: coach@nelyfit.demo</p>
                <p>Password: demo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button asChild variant="ghost" className="w-full">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}

