import type { Context, Next } from 'hono' // Controle de acesso baseado em perfis. Importa dois tipos de hono, Ex. Context (representa a requisição e a resposta atual) e Next(representa o próximo middleware ou controller que dever ser executado)
import type { Role } from '../types/auth' // Importa o tipo Role, que representa os papeis permitidos pelo sistema.
import { assetUrl } from '../utils/assets' // Importa uma função que monta a URL correta do arquivos estáticos, como CSS.

/**
 * Middleware RBAC (Role-Based Access Control).
 * Garante que apenas usuários com perfis autorizados acessem o recurso.
 * O papel 'super_admin' possui acesso universal e todas as funções dentro do escopo da Central EEC.
 */

export function requireRole(...allowedRoles: Role[]) {  // Cria uma proteção que permita acesso apenas aos pápeis informativos.
    return async (c: Context, next: Next) => {
        const user = c.get('user')
        const role = c.get('role')

        if (!user || !role) {
            return c.json({ error: 'Acesso restrito: usuário sem perfil homologado.' }, 403)
        }

        // Super admin possui acesso universal a todos os módulos autorizados.
        if (role === 'super_admin') {
            return await next()
        }

        if (allowedRoles.includes(role)) {
            return await next()
        }

        const accept = c.req.header('Accept') || ''
        if (accept.includes('text/html')) {
            return c.html(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <tittle>403 - Acesso Negado | Central EEC</tittle>
                    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
                    <link rel="stylesheet" href="${acceptUrl('/styles/tailwind.css')}">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                </head>
                <body>
                    
                </body>
                </html>`)
        }
    }
}