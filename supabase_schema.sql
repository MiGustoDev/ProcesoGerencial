-- ============================================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE — AUDITORÍAS MI GUSTO EXPERIENCE
-- ============================================================================
-- Instrucciones:
-- 1. Creá un nuevo proyecto en https://supabase.com/dashboard/new
-- 2. Entrá en "SQL Editor" de tu nuevo proyecto y creá una "New query".
-- 3. Pegá este script completo y hacé click en "Run".
-- ============================================================================

-- 1. Crear tabla de auditorías para sucursales Experience
CREATE TABLE IF NOT EXISTS public.audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tienda TEXT NOT NULL,
    auditor TEXT,
    fecha TEXT,
    colaboradores TEXT,
    "personalACargo" TEXT,
    unidades TEXT,
    total NUMERIC NOT NULL DEFAULT 0,
    estado TEXT,
    completa BOOLEAN DEFAULT false,
    evaluados INTEGER DEFAULT 0,
    "auditMode" TEXT DEFAULT 'experience',
    segmentos JSONB DEFAULT '[]'::jsonb,
    desvios JSONB DEFAULT '[]'::jsonb,
    fotos JSONB DEFAULT '[]'::jsonb,
    respuestas JSONB DEFAULT '{}'::jsonb,
    resumen TEXT,
    "savedBy" TEXT,
    "savedAt" TIMESTAMPTZ DEFAULT now()
);

-- Índices para optimizar velocidad de consulta en Dashboard e Historial
CREATE INDEX IF NOT EXISTS idx_audits_tienda ON public.audits (tienda);
CREATE INDEX IF NOT EXISTS idx_audits_fecha ON public.audits (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_audits_mode ON public.audits ("auditMode");

-- 2. Conceder permisos a los roles de Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.audits TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
DROP POLICY IF EXISTS "Permitir lectura publica de auditorias" ON public.audits;
CREATE POLICY "Permitir lectura publica de auditorias" 
ON public.audits FOR SELECT 
TO anon, authenticated, service_role
USING (true);

DROP POLICY IF EXISTS "Permitir insercion publica de auditorias" ON public.audits;
CREATE POLICY "Permitir insercion publica de auditorias" 
ON public.audits FOR INSERT 
TO anon, authenticated, service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion publica de auditorias" ON public.audits;
CREATE POLICY "Permitir actualizacion publica de auditorias" 
ON public.audits FOR UPDATE 
TO anon, authenticated, service_role
USING (true);

DROP POLICY IF EXISTS "Permitir eliminacion publica de auditorias" ON public.audits;
CREATE POLICY "Permitir eliminacion publica de auditorias" 
ON public.audits FOR DELETE 
TO anon, authenticated, service_role
USING (true);

-- 5. Habilitar Realtime para sincronización colaborativa
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'audits'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.audits;
    END IF;
END $$;

-- 6. Crear Buckets de Storage para fotos (creamos ambos para compatibilidad)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('experience-audit-photos', 'experience-audit-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('audit-photos', 'audit-photos', true)
ON CONFLICT (id) DO NOTHING;

GRANT ALL ON TABLE storage.objects TO anon, authenticated, service_role;
GRANT ALL ON TABLE storage.buckets TO anon, authenticated, service_role;

-- Políticas de Storage para fotos
DROP POLICY IF EXISTS "Permitir lectura publica de fotos experience" ON storage.objects;
CREATE POLICY "Permitir lectura publica de fotos experience" 
ON storage.objects FOR SELECT 
TO anon, authenticated, service_role
USING (bucket_id IN ('experience-audit-photos', 'audit-photos'));

DROP POLICY IF EXISTS "Permitir subida publica de fotos experience" ON storage.objects;
CREATE POLICY "Permitir subida publica de fotos experience" 
ON storage.objects FOR INSERT 
TO anon, authenticated, service_role
WITH CHECK (bucket_id IN ('experience-audit-photos', 'audit-photos'));

DROP POLICY IF EXISTS "Permitir modificacion publica de fotos experience" ON storage.objects;
CREATE POLICY "Permitir modificacion publica de fotos experience" 
ON storage.objects FOR UPDATE 
TO anon, authenticated, service_role
USING (bucket_id IN ('experience-audit-photos', 'audit-photos'));

DROP POLICY IF EXISTS "Permitir borrado publico de fotos experience" ON storage.objects;
CREATE POLICY "Permitir borrado publico de fotos experience" 
ON storage.objects FOR DELETE 
TO anon, authenticated, service_role
USING (bucket_id IN ('experience-audit-photos', 'audit-photos'));
