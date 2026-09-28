import type { Context } from 'hono' // importando o tipo de contexto de hono, um framework igualmente express 
import { HttpError } from '../errors/http-error'
import { createHonoSupabaseClient } from '../lib/supabase'
import { updateProfileName } from '../repositories/usar.repository'
import { authenticateWithPasswoed, requestPasswordReset, terminatSession } from '../services/auth.service'
import { readJsonBody } from '../utils/request'

export async function postLogin(c: Context) { // cria e exporta a função responsável pelo login. Sincrona: coisas ou funções que acontecem ao mesmo tempo, Ansincrona: as duas funções não precisa acontecer ao memso tempo
    try { // Implemetar uma tentativa de login, caso não consiga gerar a função o catch vai assumir 
        const body = (await readJsonBody(c, 4 * 1024)) as { email?: string; password?: string }
        const email = body?.email?.trim() || '' // A interrogação deve haver para corfimar se aquilo existe como body? existe o corpo da página? Existe. email? existe. trim() retirar os espaço depois e antes da senha
        const password = body?.password || ''

        const { user } = await authenticateWithPasswoed(c, email, password)

        // A sessão é estabelecida pr cookies HttpOnly seguros gerenciados são servidor.
        // Nenhum token de acesso é exposto no corpo do payload JSON.
        return c.json({
            sucess: true,
            user
        })
    } catch (err) {
        if (err instanceof HttpError) {
            return c.json({ error: err.message }, err.status)
        }
        return c.json({ error: 'Erro ao processor autenticação.'}, 500)
    }

}