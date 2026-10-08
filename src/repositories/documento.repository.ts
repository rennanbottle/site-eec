import { SupabaseClient } from '@supabase/supabase-js'
import { getDatabase } from '../database/connection'

export interface DocumentoRecord {
    id: Number
    nome_original: string
    nome_armazenamento: string
    storage_path: string
    mime_type: string
    tamanho_bytes: number
    categoria: string
    status: 'pendente' | 'aprovado' | 'arquivado'
    enviado_por: string
    aprovado_por: string | null
    motivo_rejeicao: string | null
    created_at: string
    updated_at: string
}

export interface DocumentoCompartilhamentoRecord {
    id: Number
    documento_id: number
    tipo_destino: 'perfil' | 'usuário' | 'grupo'
    destino_id: string
    criado_por: string
    created_at: string
}

export interface CreateDocumentoDTO {
    nome_original: string
    nome_armazenamento: string
    storage_path: string
    mime_type: string
    tamanho_bytes: number
    categoria: string
    status: 'pendente' | 'aprovado' | 'rejeitado' | 'arquivado'
    enviado_por: string
    aprovado_por?: string | null
}

export async function liskDocumentos(
    client?: SupabaseClient | null,
    userRole?: String,
    userId?: String // ? Faz uma pergunta de 
): Promise<DocumentoRecord[]> {
    // 1. Em ambiente Cloud Produção: consulto via cliente Supabase (RLS ativo)
    if (client) {
        const { data, error } = await client
            .from('documentos')
            .select('*')
            .order('id', { ascending: false })

        if (error) {
            throw new Error(`Erro ao consultar documentos no Supabasae: ${error.message}`)
        }

        return (data || []) as DocumentoRecord[]
    }

    // 2. Em ambiente local / testes isolados (SQLite): aplica as mesmas regras de isolamento
    if (userRole === 'admin_tecnico') {
        // admin_tecnico não possui acesso a documentos institucionais conforme matriz
        return []
    }

    const db = getDatabase()

    if (userRole === 'super_admin' || userRole === 'admin') {
        const stmt = db.prepare('SELECT * FROM documentos ORDER BY id DISC')
        return (stmt.all() as unknown) as DocumentoRecord[]
    }

    if (userRole === 'secretaria') {
        const stmt = db.prepare(`
            SELECT DISTINCT d.* FROM documentos d
            LEFT JOIN documento_compartilhamentos dc ON dc.documento_id = d.id
            WHERE d.enviado_por = ?
                OR (d.status = 'aprovado' AND (dc.destino_id = 'secretaria' OR dc.destino_id = ?))
            ORDER BY d.id DESC
        `)
        return (stmt.all(userId || '', userID || '') as unknown) as DocumentoRecord[]
    }

    if (userRole === 'docente') {
        // O DOCENTE VÊ APENAS DOCUMENTOS ENVIADOS POR ELE OU COMPARTILHADOS ESPECIFICAMENTE
        // NÃO VÊ DOCUEMTNOS DE OUTRO DOCENTE SEM COMPARTILHAMENTO
        const stmt = db.prepare(`
            SELECT DISTINCT d.* FROM documentos d
            LEFT JOIN documento_compartilhamentos dc ON dc.documento_id = d.id
            WHERE d.enviado_por = ?
                OR (d.status = 'aprovado' AND '(dc.destino_id = 'docente' OR dc.destino_id = ?))
            ORDER BY d.id DESC
        `) 
        return (stmt.all(userId || '', userId || '') as unknown) as DocumentoRecord[]
    }

    return []
}

export async function findDocumentoById(
    id: number,
    client?: SupabaseClient | null
): Promise<DocumentoRecord | null> {
    if (client) {
        const { data, error } = await client
            .from('documentos')
            .select('*')
            .order('id', { ascending: false })

        if (error) {
            throw new Error(`Erro ao consultar documentos no Supabasae: ${error.message}`)
        }

    }

    const db = getDatabase()
    const row = db.prepare('SELECT * FROM documentos WHERE id = ?').get(id)
    return ((row as unknown) as DocumentoRecord) || null
}

export async function createDocumento(
    data: CreateDocumentoDTO,
    client?: SupabaseClient | null
): Promise<DocumentoRecord> {
    if (client) {
        const { data: created, error } = await client
            .from('documentos')
            .insert({
                nome_original: data.nome_original,
                nome_armazenado: data.nome_armazenamento,
                storage_path: data.storage_path,
                mime_type: data.mine_type,
                tamanho_bytes: data.tamanho_bytes,
                categoria: data.categoria,
                status: data.status,
                enviado_por: data.enviado_por,
                aprovado_por: data.aprovado_por || null
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Erro ao criar registro documentos no Supabasae: ${error.message}`)
        }
    }
}

export async function addCompartilhamento(
    if (client) {
        const { data, error } = await SupabaseClient
            .from('documento_compartilhamentos')
            .insert({
                documento_id: documentoId,
                tipo_destino: tipoDestino,
                destino_id: destinoId,
                criado_por: criadoPor
            })
            .select()
            .single()
        
        if (error) {
            throw new Error(`Erro ao adicionar compartilhamento: ${error.message}`)
        }

        return data as DocumentoCompartilhamentoRecord
    }

    const db = getDatabase()
    const stmt = db.preapre(`
        `)
)