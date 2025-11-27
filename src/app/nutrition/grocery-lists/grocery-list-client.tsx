'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Check, X, Printer, Download } from 'lucide-react';
import { Lang } from '@/lib/i18n';

type GroceryItem = {
  name: string;
  count: number;
  sources: string[];
};

export function GroceryListClient({
  groceryList,
  mealPlans,
  lang,
}: {
  groceryList: GroceryItem[];
  mealPlans: { id: string; name: string }[];
  lang: Lang;
}) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(true);

  const toggleItem = (name: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(name)) {
      newChecked.delete(name);
    } else {
      newChecked.add(name);
    }
    setCheckedItems(newChecked);
  };

  const checkAll = () => {
    setCheckedItems(new Set(groceryList.map(item => item.name)));
  };

  const uncheckAll = () => {
    setCheckedItems(new Set());
  };

  const filteredList = showCompleted
    ? groceryList
    : groceryList.filter(item => !checkedItems.has(item.name));

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const text = groceryList
      .map(item => `${checkedItems.has(item.name) ? '✓' : '☐'} ${item.name}${item.count > 1 ? ` (x${item.count})` : ''}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Items' : 'Total de Artículos'}</p>
            <p className="text-2xl font-bold">{groceryList.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">{lang === 'en' ? 'Completed' : 'Completados'}</p>
            <p className="text-2xl font-bold text-emerald-400">{checkedItems.size}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">{lang === 'en' ? 'Remaining' : 'Pendientes'}</p>
            <p className="text-2xl font-bold text-yellow-400">{groceryList.length - checkedItems.size}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              {lang === 'en' ? 'Shopping List' : 'Lista de Compras'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={checkAll}>
                {lang === 'en' ? 'Check All' : 'Marcar Todos'}
              </Button>
              <Button variant="ghost" size="sm" onClick={uncheckAll}>
                {lang === 'en' ? 'Uncheck All' : 'Desmarcar Todos'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCompleted(!showCompleted)}>
                {showCompleted
                  ? lang === 'en' ? 'Hide Completed' : 'Ocultar Completados'
                  : lang === 'en' ? 'Show Completed' : 'Mostrar Completados'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Print' : 'Imprimir'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Export' : 'Exportar'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredList.length === 0 ? (
            <div className="text-center py-12">
              <Check className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <p className="text-slate-400">
                {lang === 'en'
                  ? 'All items completed! 🎉'
                  : '¡Todos los artículos completados! 🎉'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredList.map((item) => {
                const isChecked = checkedItems.has(item.name);
                return (
                  <div
                    key={item.name}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/50 opacity-60'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => toggleItem(item.name)}
                  >
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-600'
                    }`}>
                      {isChecked && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${isChecked ? 'line-through text-slate-500' : ''}`}>
                        {item.name}
                      </p>
                      {item.count > 1 && (
                        <p className="text-xs text-slate-400">
                          {lang === 'en' ? 'Used in' : 'Usado en'} {item.count} {lang === 'en' ? 'meals' : 'comidas'}
                        </p>
                      )}
                      {item.sources.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {item.sources.slice(0, 2).map(source => (
                            <Badge key={source} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                          {item.sources.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.sources.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

