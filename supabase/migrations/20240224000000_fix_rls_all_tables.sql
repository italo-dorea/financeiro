-- Fix RLS policies for all tables
-- Ensures authenticated users can perform CRUD operations

-- ============================================================
-- SPONSORS
-- ============================================================
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- SELECT: any authenticated user can read
CREATE POLICY "sponsors_select_authenticated"
  ON public.sponsors FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: any authenticated user can create
CREATE POLICY "sponsors_insert_authenticated"
  ON public.sponsors FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: any authenticated user can update
CREATE POLICY "sponsors_update_authenticated"
  ON public.sponsors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: any authenticated user can delete
CREATE POLICY "sponsors_delete_authenticated"
  ON public.sponsors FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- FAMILIES
-- ============================================================
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "families_select_authenticated"
  ON public.families FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "families_insert_authenticated"
  ON public.families FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "families_update_authenticated"
  ON public.families FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "families_delete_authenticated"
  ON public.families FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- BILL_OCCURRENCES
-- ============================================================
ALTER TABLE public.bill_occurrences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bill_occurrences_select_authenticated"
  ON public.bill_occurrences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "bill_occurrences_insert_authenticated"
  ON public.bill_occurrences FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "bill_occurrences_update_authenticated"
  ON public.bill_occurrences FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "bill_occurrences_delete_authenticated"
  ON public.bill_occurrences FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- BILL_RULES
-- ============================================================
ALTER TABLE public.bill_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bill_rules_select_authenticated"
  ON public.bill_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "bill_rules_insert_authenticated"
  ON public.bill_rules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "bill_rules_update_authenticated"
  ON public.bill_rules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "bill_rules_delete_authenticated"
  ON public.bill_rules FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- USER_ROLES (read-only for authenticated, admin managed)
-- ============================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select_authenticated"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);
