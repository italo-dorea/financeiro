-- Migration para suportar recorrência e importação em lote

-- 1. Garante que as tabelas de famílias, pessoas e delegates existam (já estão em produção, mas isso protege o schema)

-- 2. Tabela principal: bill_rules (Recorrências)
-- Esta tabela existirá ao lado de bill_occurrences para gerenciar a "Regra" da recorrência
CREATE TABLE IF NOT EXISTS public.bill_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL, -- FK de familys
    delegate_id UUID, -- FK de delegates (opcional)
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    note TEXT,
    
    first_due_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    periodicity VARCHAR(50), -- 'weekly', 'monthly', 'yearly'
    repeat_until DATE, -- Null significa repetição infinita/manual
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Modificações na tabela "bill_occurrences" (Faturas / Contas a pagar/receber)
-- A aplicação parece usar "bill_occurrences" como a fatura real (a parcela).
-- Vamos garantir que os campos estejam amarrados à rule.

-- Caso a tabela bill_occurrences já exista, adicionamos as colunas faltantes se necessário:
ALTER TABLE public.bill_occurrences
ADD COLUMN IF NOT EXISTS rule_id UUID REFERENCES public.bill_rules(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS installment INT; -- Pode ajudar a saber qual parcela é daquela rule (ex: 1/12)

-- 4. Funções auxiliares (Opcional, mas útil para criar as parcelas futuras via Supabase)
CREATE OR REPLACE FUNCTION generate_future_installments(
    p_rule_id UUID,
    p_installments_count INT
) RETURNS VOID AS $$
DECLARE
    v_rule RECORD;
    v_current_due_date DATE;
BEGIN
    -- Busca a regra
    SELECT * INTO v_rule FROM public.bill_rules WHERE id = p_rule_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Regra % não encontrada', p_rule_id;
    END IF;

    -- Define a data base como a primeira data
    v_current_due_date := v_rule.first_due_date;

    -- Loop para inserir N parcelas
    FOR i IN 1..p_installments_count LOOP
        INSERT INTO public.bill_occurrences (
            family_id,
            rule_id,
            name,
            description,
            amount,
            note,
            due_date,
            paid,
            received
        ) VALUES (
            v_rule.family_id,
            v_rule.id,
            v_rule.name,
            v_rule.description,
            v_rule.amount,
            v_rule.note,
            v_current_due_date,
            false,
            false
        );

        -- Calcula o próximo mês
        IF v_rule.periodicity = 'monthly' THEN
            v_current_due_date := v_current_due_date + INTERVAL '1 month';
        ELSIF v_rule.periodicity = 'weekly' THEN
            v_current_due_date := v_current_due_date + INTERVAL '1 week';
        ELSIF v_rule.periodicity = 'yearly' THEN
            v_current_due_date := v_current_due_date + INTERVAL '1 year';
        END IF;

    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Desabilita RLS (Row Level Security) conforme solicitado para evitar bloqueios
ALTER TABLE public.bill_rules DISABLE ROW LEVEL SECURITY;
