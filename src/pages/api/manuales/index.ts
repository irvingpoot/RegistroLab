import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
    const body = await request.json().catch(() => null);

    if (!body || !body.titulo || !body.descripcion || !body.url || !body.tipo) {
        return new Response(JSON.stringify({ error: 'Faltan campos obligatorios.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const TIPOS_VALIDOS = ['CANVA', 'WORD', 'DRIVE', 'VIDEO', 'EXCEL', 'WEB'];
    if (!TIPOS_VALIDOS.includes(body.tipo)) {
        return new Response(JSON.stringify({ error: 'Tipo de manual inválido.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { data: manual, error } = await supabase
        .from('manuales')
        .insert({ titulo: body.titulo, descripcion: body.descripcion, url: body.url, tipo: body.tipo })
        .select()
        .single();

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ manual }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
    });
};