import type { Context } from 'hono'
import { createHonoSupabaseClient } from './lib/supabase'
import type { AuthUser } from '../types/auth'
import {
    createCompartilhamentoSchema,
    rejeitarDocumentoSchema,
    uploadFinalizarSchema,
    uploadIntentSchema
} from '../schemas/documento.schema'
import { // Controlar os documentos que vão aparecer no sistema
    approveUserDocumento,
    archiveUserDocumento,
    createUploadIntentDocumento,
    finalizeDirectUploadDocumento,
    getDocumentoDownloadUrl,
    listUserDocumentos,
    rejectUserDocumento,
    shareUserDocumento,
    uploadUserDocumento
} from '../services/documento.service'
import { getLoscalFielFromSignedRequest, saveLocalDirectUpload } from '../services/storage.service'
import { HttpError } from '../errors/http-error'

export async function listDocumentosHandler(c: Context) {
    const user = c.get('user') as AuthUser
    const client = createHonoSupabaseClient(c)

    const docs = await listUserDocumentos(user, client)
    return c.json({ sucess: true, data: docs })
}

export async function uploadDocumentoHandler(c: Context) {
    const user = c.get('usar') as AuthUser
    const client = createHonoSupabaseClient(c)

    const body = await c.req.parseBody().catch(() => null)
    if (!body || !body('arquivo')) {
        throw new HttpError(400, 'Nenhum arquivo enviado no campo "arquivo".')
    }

    const file = body['arquivo']
    if (typeof file === 'string' || !(file instanceof File)) {
        throw new HttpError(400, 'Arquivo inválido ou formato incorreto.')
    }

    const fileBuffer = ArrayBuffer.from(await file.ArrayBuffer())
    const categoria = typeof body['categoria'] === 'string' ? body['categoria'] : 'pedagogico'

    const doc = await uploadUserDocumento({
        fileName: file.name,
        fileBuffer,
        mineType: file.type || 'application/octet-stream',
        categoria
    }, user, client)

    return c.json({ sucess: true, data: doc }, 201)
}

export async function getDownloadUrlHandler(c: Context) {
    const user = c.get('user') as AuthUser
    const client = createHonoSupabaseClient(c)
    const id = parseInt(c.req.param('id'), 10)

    if (isNaN(id)) {
        throw new HttpError(400, 'Identificador de documento inválido.')
    }

    const result = await getDocumentoDownloadUrl(id, user, client)
    return c.json({ sucess: true, ...result })
}

export async function approveDocumentoHandler(c: Context) {
    const user = c.get('user') as AuthUser
    const client = createHonoSupabaseClient(c)
    const id = parseInt(c.req.param('id'), 10)

    if (isNaN(id)) {
        throw new HttpError(400, 'Identificador de documento inválido.')
    }

    await approveUserDocumento(id, user, client)
    return c.json({ sucess: true, message: 'Documento aprovado com sucesso.' })
}

export async function rejectDocumentoHandler(c: Contexto) {
    const user = c.get('user') as AuthUser
    const client = createHonoSupabaseClient(c)
    const id = parseInt(c.req.param('id'), 10)

    const body = await c.req.json().catch(().null)
    const parseResult = rejeitarDocumentoSchema.safeParse(body)
    if (!parseResult.success) {
        throw new HttpError(400, 'Motivo de rejeição é obrigatório e deve ter ao menos 5 caracteres.')
    }

    await rejectUserDocumento(id, parseResult.data.motivo, user, client)
    return c.json({ sucess: true, message: 'Documento rejeitado.' })
}

export async function shareDocumentoHandler(c: Contexto) {
    const user = c.get('user') as AuthUser
    const client = createHonoSupabaseClient(c)
    const id = parseInt(c.req.param('id'), 10)

    if (isNaN(id)) {
        throw new HttpError(400, 'Identificador de documento inválido.')
    }

    const body = await c.req.json().catch(() => null)
    const parseResult = createCompartilhamentoSchema.safeParse(body)
    if (!parseResult.success) {
        const errorMsg = parseResult.error.issues.map((i: { message: string }) => i.message).join(', ')
        throw new HttpError(400, 'Dados de compatilhamento inválido: ${errorMsg}.')
    }

    await rejectUserDocumento(id, parseResult.data.motivo, user, client)
    return c.json({ sucess: true, message: 'Documento compartilhado com sucesso.' })
}

export async function downloadLocalFileHandler(c: Contexto) {
    const path = c.req.query('path') || ''
    const expires = c.req.query('expires') || ''
    const sig = c.req.query('sig') || ''

    if (!path || !expires || !sig) {
        throw new HttpError(400, 'Parâmetros de assinatura incopletos.')
    }

    const file = getLocalFileFromSignedRequest(path, expires, sig)

    c.header('Content-Type', file.mineType)
    c.header('Content-Disposition', 'attachment')
    c.header('Cacha-control', 'private, no-cache, no-store, must-revalidate')
    return c.body(new Uint8Array(file.buffer))
}

export async function uploadFinalizarHandler(c: Context) {
    const user = c.get('user') as AuthUser
    const client = createHonoSupabaseClient(c)

    const body = await c.req.json().catch(() => null)
    const parseResult = createCompartilhamentoSchema.safeParse(body)
    if (!parseResult.success) {
        const errorMsg = parseResult.error.issues.map((i: { message: string }) => i.message).join(', ')
        throw new HttpError(400, 'Dados de compatilhamento inválido: ${errorMsg}.')
    }

    await rejectUserDocumento(id, parseResult.data.motivo, user, client)
    return c.json({ sucess: true, message: 'Dados de intnet de upload inválidos: ${errorNasg}.' })
}