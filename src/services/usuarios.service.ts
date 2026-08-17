import { clerkClient } from "@clerk/astro/server";
import type { Rol } from "../lib/permisos";

export type UsuarioResumen = {
    id: string;
    nombre: string;
    username: string;
    rol: Rol | undefined;
    creadoEl: number;
};

type ClerkContext = Parameters<typeof clerkClient>[0];

function normalizarUsuario(u: any): UsuarioResumen {
    return {
        id:       u.id,
        nombre:   `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || (u.username ?? "Sin nombre"),
        username: u.username ?? "—",
        rol:      u.publicMetadata?.role as Rol | undefined,
        creadoEl: u.createdAt,
    };
}

export async function listarUsuarios(astroContext: ClerkContext): Promise<UsuarioResumen[]> {
    const client = clerkClient(astroContext);
    const response = await client.users.getUserList({
        limit:   100,
        orderBy: "-created_at",
    });
    const lista = Array.isArray(response) ? response : (response.data ?? []);
    return lista.map(normalizarUsuario);
}

export async function crearUsuario(
    astroContext: ClerkContext,
    datos: { nombre: string; apellido: string; username: string; password: string; rol: Rol },
): Promise<void> {
    if (datos.rol === "admin") {
        throw new Error("El rol admin no se asigna desde este panel.");
    }

    const client = clerkClient(astroContext);
    await client.users.createUser({
        firstName:      datos.nombre,
        lastName:       datos.apellido,
        username:       datos.username,
        password:       datos.password,
        publicMetadata: { role: datos.rol },
    });
}

export async function actualizarUsuario(
    astroContext: ClerkContext,
    userId: string,
    datos: { username: string; rol: Rol },
): Promise<void> {
    const client = clerkClient(astroContext);

    if (datos.rol === "admin") {
        const objetivo = await client.users.getUser(userId);
        if (objetivo.publicMetadata?.role !== "admin") {
            throw new Error("El rol admin no se asigna desde este panel.");
        }
    }

    await client.users.updateUser(userId, { username: datos.username });
    await client.users.updateUserMetadata(userId, {
        publicMetadata: { role: datos.rol },
    });
}

export async function eliminarUsuario(
    astroContext: ClerkContext,
    userId: string,
    solicitanteId: string,
): Promise<void> {
    if (userId === solicitanteId) {
        throw new Error("No puedes eliminar tu propia cuenta desde este panel.");
    }

    const client = clerkClient(astroContext);
    await client.users.deleteUser(userId);
}