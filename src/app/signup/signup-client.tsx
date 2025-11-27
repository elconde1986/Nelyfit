'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Mail, Phone, Key, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle } from '@/components/LanguageToggle';
import { translations, Lang } from '@/lib/i18n';
import { signup } from './actions';

export default function SignupClient({ initialLang }: { initialLang: Lang }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [lang, setLang] = useState<Lang>(initialLang);
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [accessCode, setAccessCode] = useState('');
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    accessCode: '',
  });

  useEffect(() => {
    const cookieLang = document.cookie.match(/lang=([^;]+)/)?.[1] as Lang;
    if (cookieLang) setLang(cookieLang);
  }, []);

  const t = translations.login[lang];

  const handleCheckCode = async () => {
    if (!accessCode.trim()) return;
    
    try {
      const res = await fetch('/api/auth/check-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode }),
      });
      const data = await res.json();
      
      if (data.valid) {
        setCodeValid(true);
        setFormData({ ...formData, accessCode });
      } else {
        setCodeValid(false);
      }
    } catch (err) {
      setCodeValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    try {
      const result = await signup(formData);
      if (result.success) {
        router.push('/client/today');
        router.refresh();
      } else {
        setError(result.error || 'Signup failed');
        setIsPending(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-end mb-2">
          <LanguageToggle currentLang={lang} />
        </div>
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4 shadow-2xl shadow-emerald-500/30 relative">
            <User className="w-10 h-10 text-white" strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-yellow-900" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Sign Up
            </span>
          </h1>
          <p className="text-slate-400">Create your NelsyFit account</p>
        </div>

        <Card className="border-emerald-500/30 shadow-xl shadow-emerald-500/10">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Access Code Section */}
            <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-emerald-400" />
                <p className="text-sm font-medium text-slate-300">Have an access code? (Optional)</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    setCodeValid(null);
                  }}
                  placeholder="Enter access code"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-50 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button type="button" onClick={handleCheckCode} variant="secondary" size="sm">
                  Check
                </Button>
              </div>
              {codeValid === true && (
                <p className="text-xs text-emerald-400 mt-2">✓ Valid code</p>
              )}
              {codeValid === false && (
                <p className="text-xs text-red-400 mt-2">✗ Invalid code</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/50 px-4 py-3 text-sm text-red-400 animate-fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-300">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="your@email.com"
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
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isPending} size="lg">
                {isPending ? (
                  'Creating account...'
                ) : (
                  <>
                    Sign Up
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-xs text-center text-slate-500 mb-3">
                Already have an account?
              </p>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/login/client">
                  Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

