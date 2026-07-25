import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card";
import { Package, CheckCircle2, XCircle } from "lucide-react";

interface StatsCardsProps {
  total: number;
  ativos: number;
  inativos: number;
}

export function StatsCards({ total, ativos, inativos }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription className="font-medium text-slate-600">
            Total de Produtos
          </CardDescription>
          <Package className="w-5 h-5 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{total}</div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription className="font-medium text-emerald-600">
            Produtos Ativos
          </CardDescription>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600">{ativos}</div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription className="font-medium text-rose-600">
            Produtos Inativos
          </CardDescription>
          <XCircle className="w-5 h-5 text-rose-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-rose-600">{inativos}</div>
        </CardContent>
      </Card>
    </div>
  );
}
