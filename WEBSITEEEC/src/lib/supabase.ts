import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { createclient, SupabaseClient } from '@supabase/supabase-js'
import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { getEnv } from '../config/env'
import { registrarEtapaAuth } from '../utils/auth-diagnostics'

