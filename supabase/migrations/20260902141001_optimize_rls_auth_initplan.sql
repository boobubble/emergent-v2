-- Fix Supabase performance advisor: auth_rls_initplan
-- Wrap auth.<fn>() calls in RLS policy expressions in a scalar subquery
-- ( auth.uid() -> (select auth.uid()) ) so Postgres evaluates them once per
-- statement (as an initplan) instead of once per row. This is semantically
-- identical to the original policies.
--
-- The regex protect/wrap/restore steps make this idempotent and prevent
-- double-wrapping any expression that is already optimized.
DO $$
DECLARE
  r record;
  nq text;
  nc text;
  stmt text;
  n int := 0;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (coalesce(qual,'') ~ 'auth\.(uid|role|jwt|email)\(\)'
           OR coalesce(with_check,'') ~ 'auth\.(uid|role|jwt|email)\(\)')
  LOOP
    nq := r.qual;
    nc := r.with_check;
    IF nq IS NOT NULL THEN
      nq := regexp_replace(nq, '\(\s*SELECT\s+auth\.(uid|role|jwt|email)\(\)', '<<W:\1', 'gi');
      nq := regexp_replace(nq, 'auth\.(uid|role|jwt|email)\(\)', '(select auth.\1())', 'g');
      nq := regexp_replace(nq, '<<W:(uid|role|jwt|email)', '( SELECT auth.\1()', 'g');
    END IF;
    IF nc IS NOT NULL THEN
      nc := regexp_replace(nc, '\(\s*SELECT\s+auth\.(uid|role|jwt|email)\(\)', '<<W:\1', 'gi');
      nc := regexp_replace(nc, 'auth\.(uid|role|jwt|email)\(\)', '(select auth.\1())', 'g');
      nc := regexp_replace(nc, '<<W:(uid|role|jwt|email)', '( SELECT auth.\1()', 'g');
    END IF;
    IF (nq IS DISTINCT FROM r.qual) OR (nc IS DISTINCT FROM r.with_check) THEN
      stmt := 'ALTER POLICY ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
      IF (nq IS DISTINCT FROM r.qual) THEN
        stmt := stmt || ' USING (' || nq || ')';
      END IF;
      IF (nc IS DISTINCT FROM r.with_check) THEN
        stmt := stmt || ' WITH CHECK (' || nc || ')';
      END IF;
      EXECUTE stmt;
      n := n + 1;
    END IF;
  END LOOP;
  RAISE NOTICE 'auth_rls_initplan: altered % policies', n;
END $$;
