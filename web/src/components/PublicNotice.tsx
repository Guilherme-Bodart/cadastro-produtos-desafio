import Link from "next/link";

interface PublicNoticeProps {
  isAuthenticated: boolean;
}

export function PublicNotice({ isAuthenticated }: PublicNoticeProps) {
  if (isAuthenticated) return null;

  return (
    <div className="flex items-center gap-2.5 text-xs text-slate-500 bg-slate-100/80 border border-slate-200/80 px-4 py-2.5 rounded-lg">
      <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
      <span>
        <strong className="font-semibold text-slate-700">
          Modo de Visualização Pública:
        </strong>{" "}
        Você está navegando como visitante.{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
        >
          Faça login
        </Link>{" "}
        para cadastrar, editar ou remover produtos.
      </span>
    </div>
  );
}
