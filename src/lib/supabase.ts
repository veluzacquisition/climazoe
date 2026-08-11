import { createClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase para el navegador.
 *
 * Usa la clave publishable (anon), así que TODO lo que se consulte desde aquí
 * pasa por RLS. En particular `precio_proveedor` no debe ser legible por el
 * rol anónimo: las políticas de supabase/schema.sql exponen la vista
 * `productos_publicos`, no la tabla cruda.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Falso mientras se trabaja con el catálogo local, antes de conectar Supabase. */
export const supabaseConfigurado = Boolean(url && anonKey);

if (!supabaseConfigurado && import.meta.env.DEV) {
  console.warn(
    '[Clima Zoe] Supabase sin configurar: definí VITE_SUPABASE_URL y ' +
      'VITE_SUPABASE_ANON_KEY en .env.local. Mientras tanto el catálogo se ' +
      'lee del JSON local.',
  );
}

export const supabase = supabaseConfigurado
  ? createClient(url!, anonKey!, { auth: { persistSession: false } })
  : null;
