import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import CreateCodeClient from './create-code-client';

export const dynamic = 'force-dynamic';

export default async function AdminCodesPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  const codes = await prisma.temporaryCode.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Temporary Codes</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage access codes</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Codes</CardTitle>
              </CardHeader>
              <CardContent>
                {codes.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No codes created yet</p>
                ) : (
                  <div className="space-y-2">
                    {codes.map((code) => (
                      <div
                        key={code.id}
                        className="p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono font-bold text-lg">{code.code}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {code.type} • {code.usedCount}/{code.maxUses} uses
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">
                              Expires: {new Date(code.expiresAt).toLocaleDateString()}
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
          <div>
            <CreateCodeClient adminId={user.id} />
          </div>
        </div>
      </div>
    </main>
  );
}

