import { site } from './site.config';

const formateadorCOP = new Intl.NumberFormat(site.locale, {
  style: 'currency',
  currency: site.moneda,
  maximumFractionDigits: 0,
});

/** 1565000 -> "$ 1.565.000". Devuelve null si no hay precio que mostrar. */
export function precio(valor: number | null | undefined): string | null {
  if (valor == null || Number.isNaN(valor)) return null;
  return formateadorCOP.format(valor);
}

/** Slug estable para URLs: "Batería Gel 200Ah" -> "bateria-gel-200ah". */
export function slugificar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
