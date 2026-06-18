import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const PUT: APIRoute = async ({ params, request }) => {
    const { id } = params;
    if (!id) {
        return new Response(JSON.stringify({ error: 'ID requerido.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

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
        .update({ titulo: body.titulo, descripcion: body.descripcion, url: body.url, tipo: body.tipo })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ manual }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};

export const DELETE: APIRoute = async ({ params }) => {
    const { id } = params;
    if (!id) {
        return new Response(JSON.stringify({ error: 'ID requerido.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { error } = await supabase
        .from('manuales')
        .delete()
        .eq('id', id);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};