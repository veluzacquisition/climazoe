/**
 * Placeholder honesto para las secciones que todavía no tienen contenido real.
 * Deja explícito qué falta en vez de rellenar con texto inventado.
 */
export default function EnConstruccion({
  titulo,
  nota,
}: {
  titulo: string;
  nota: string;
}) {
  return (
    <div className="contenedor py-24">
      <h1 className="text-4xl font-bold">{titulo}</h1>
      <p className="mt-4 max-w-xl rounded-marca border border-alerta/30 bg-alerta/10 px-4 py-3 text-sm text-alerta">
        {nota}
      </p>
    </div>
  );
}
