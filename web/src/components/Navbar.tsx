import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Package, UserPlus } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  isAuthenticated: boolean;
  currentUser: any;
  onLogout: () => void;
}

export function Navbar({
  isAuthenticated,
  currentUser,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight text-lg">
              Catálogo de Produtos
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Gerenciador de Inventário
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>
                  Olá,{" "}
                  <strong className="text-slate-900">
                    {currentUser?.name || "Usuário"}
                  </strong>
                </span>
              </div>

              <Button
                variant="outline"
                onClick={onLogout}
                className="gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastre-se</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
