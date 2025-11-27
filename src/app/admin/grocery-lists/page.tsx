import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminGroceryListsPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Grocery List Configuration' : 'Configuración de Lista de Compras'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'Manage grocery list settings and formatting rules'
              : 'Gestiona la configuración y reglas de formato de listas de compras'}
          </p>
        </header>

        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {lang === 'en'
                ? 'Grocery list configuration coming soon'
                : 'Configuración de lista de compras próximamente'}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

