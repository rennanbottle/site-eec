import type { Context } from 'hono'
import { validateResquestSession } from '../services/auth.service'
import type { AuthUser, Role } from '../types/auth'

declare module 'hono' {
    interface ContextVariableMap {
        user: AuthUser
        role: Role | null
    }
}

/**
 * Diddleware de Autenticação da Central EEC.
 * Valida a sessão via cookies oficiais (@supabase/ssr ou eec_session local)
 * e aplica cabeçalhos estritos de controle de cache em todas as respostas autenticadas.
 */
export async function requireAuth(c: Context, next: Next) {
    const user = await validateResquestSession(c)

    if (!user) {
        const accept = c.req.header("Accept") || ''
        const isAPI = c.req.path.startWith('/api')
        if (accept.includes('text/html') || (!isApi && !accept.includes('application/json'))) {
            
        }
    }
}