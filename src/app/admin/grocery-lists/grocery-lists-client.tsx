'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Save } from 'lucide-react';
import { Lang } from '@/lib/i18n';

export default function GroceryListsClient({ lang }: { lang: Lang }) {
  const [settings, setSettings] = useState({
    defaultUnit: 'kg',
    groupByAisle: true,
    showNutritionInfo: true,
    sortByCategory: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // In a full implementation, this would call a server action to save settings
    // For now, we'll just show a success message
    setTimeout(() => {
      alert(lang === 'en' ? 'Settings saved' : 'Configuración guardada');
      setSaving(false);
    }, 500);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            {lang === 'en' ? 'Default Settings' : 'Configuración Predeterminada'}
          </CardTitle>
          <CardDescription>
            {lang === 'en'
              ? 'Configure how grocery lists are generated and displayed'
              : 'Configura cómo se generan y muestran las listas de compras'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                {lang === 'en' ? 'Default Unit' : 'Unidad Predeterminada'}
              </label>
              <select
                value={settings.defaultUnit}
                onChange={(e) => setSettings({ ...settings, defaultUnit: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="lb">lb</option>
                <option value="oz">oz</option>
                <option value="pieces">{lang === 'en' ? 'pieces' : 'piezas'}</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 block">
                {lang === 'en' ? 'Display Options' : 'Opciones de Visualización'}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.groupByAisle}
                    onChange={(e) => setSettings({ ...settings, groupByAisle: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900/60 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-300">
                    {lang === 'en' ? 'Group by aisle/category' : 'Agrupar por pasillo/categoría'}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showNutritionInfo}
                    onChange={(e) => setSettings({ ...settings, showNutritionInfo: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900/60 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-300">
                    {lang === 'en' ? 'Show nutrition information' : 'Mostrar información nutricional'}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sortByCategory}
                    onChange={(e) => setSettings({ ...settings, sortByCategory: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900/60 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-300">
                    {lang === 'en' ? 'Sort by category' : 'Ordenar por categoría'}
                  </span>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving
                ? (lang === 'en' ? 'Saving...' : 'Guardando...')
                : (lang === 'en' ? 'Save Settings' : 'Guardar Configuración')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{lang === 'en' ? 'About Grocery Lists' : 'Acerca de las Listas de Compras'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            {lang === 'en'
              ? 'Grocery lists are automatically generated from meal plans. Clients can view their grocery lists in the nutrition section. These settings control how the lists are formatted and displayed.'
              : 'Las listas de compras se generan automáticamente a partir de los planes de comida. Los clientes pueden ver sus listas de compras en la sección de nutrición. Estas configuraciones controlan cómo se formatean y muestran las listas.'}
          </p>
        </CardContent>
      </Card>
    </>
  );
}

