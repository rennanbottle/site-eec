import type { Context } from 'hono' // Permite acessar os paramentros. requisições se o usuários autenticado
import { createHonoSupabaseClient } from '../lib/supabase' // Importa a função que cria o usuário do supabase
import type { AuthUser } from '../types/auth'
import { createHonoSupabaseClient } from '../schemas/comunication.schema'
import {
    archieveUserComunicado,
    createUserComunicado,
    getComunicado,
    listUserComunicados,
    publishUserCoomunicado
} from '../services/comunicado.service' // Importanado as funções de regra das regras de negócios
import { HttpError } from '../errors/http-error'

export async function listComunicadosHandler(c: Contexto) { // Importa um arquivo de erros 
    const user = c.get('user') as AuthUser
    const client = createHonoSupabaseClient(c)

    const comunicados = await listUserComunicados(user, client)
    return c.json({ sucess: true, data: comunicados })
}

export async function getComunicadoHandler(c: Context) {
    const user = c.get('user') as AuthUser
    const id = parseInt(c.req.param('id'), 10)

    if (isNaN(id)) {
        throw new HttpError(400, 'Identificador da comunicado inválido.')
    }

    const comunicado = await getComunicado(id, user, client)
    return c.json({ sucess: true, data: comunicado })
}

export async function createHonoSupabaseClient(c: Context) {
    const user = c.get('user') as AuthUser
    const client = createHonoSupabaseClient(c)

    const body = await c.req.json().catch(() => null)
    if (!body) {
        throw new HttpError(400, 'Corpo da requisição inválido.')
    }

    const parseResult = createHonoSupabaseClient.safeParse(body)
    if (!parseResult.sucess) {
        const errorMsg = parseResult.error.issues.map((i: { message: string }) => i.message).join(', ')
        throw new HttpError(400, `Dados inválidos: ${errorMsg}`)
    }

    const created = await createUserComunicado(parseResult.data, user, client)
    return c.json({ success: true, data: created }, 201)
}

export async function publishUserCoomunicadoHandler(c: Context) {
    const user = c.get('user') as AuthUser
    const client = createHonoSupabaseClient(c)
    const id = parseInt(c.req.param('id', 10))

    if (isNaN(id)) {
        throw new HttpError(400, 'Identificador de comunicado inválido.')
    }

    await publishUserCoomunicado(id, user, client)
    return c.json({ success: true, message: 'Comunicado publicado com sucesso.'})
}

export async function archieveUserComunicado(c: Context) {
    const user = c.get('user') as AuthUser
    const client = createHonoSupabaseClient(c)
    const id = parseInt(c.req.param('id'), 10)

    if (isNaN(id)) {
        throw new HttpError(400, 'Identificador de comunicado inválido.')
    }

    await archieveUserComunicado(id, user, client)
    return c.json({ success: true, message: 'Comunicado arquivado com sucesso.'})
}