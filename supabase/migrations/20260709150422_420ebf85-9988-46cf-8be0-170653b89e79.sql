
-- Extend backup system: single admin RPC that returns all extras
-- (storage config, RLS policies, extensions, realtime, cron, project metadata)
-- as JSON so the app can format them into their respective files.
-- Future-proof: reads live catalogs, no hardcoded lists.

CREATE OR REPLACE FUNCTION public.admin_export_extras()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  v_storage_buckets jsonb := '[]'::jsonb;
  v_policies jsonb := '[]'::jsonb;
  v_extensions jsonb := '[]'::jsonb;
  v_publications jsonb := '[]'::jsonb;
  v_realtime_tables jsonb := '[]'::jsonb;
  v_cron_jobs jsonb := '[]'::jsonb;
  v_auth_providers jsonb := '[]'::jsonb;
  v_migrations jsonb := '[]'::jsonb;
  v_pg_version text;
  v_table_count int := 0;
  v_bucket_count int := 0;
  v_user_count int := 0;
  v_file_count bigint := 0;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Storage buckets
  BEGIN
    SELECT COALESCE(jsonb_agg(to_jsonb(b) ORDER BY b.name), '[]'::jsonb),
           count(*)
      INTO v_storage_buckets, v_bucket_count
      FROM storage.buckets b;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    SELECT count(*) INTO v_file_count FROM storage.objects;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- RLS policies (all schemas the API can see)
  BEGIN
    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.schemaname, p.tablename, p.policyname), '[]'::jsonb)
      INTO v_policies
      FROM pg_policies p
      WHERE p.schemaname IN ('public','storage');
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Extensions
  BEGIN
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
             'name', e.extname,
             'version', e.extversion,
             'schema', n.nspname
           ) ORDER BY e.extname), '[]'::jsonb)
      INTO v_extensions
      FROM pg_extension e
      JOIN pg_namespace n ON n.oid = e.extnamespace;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Realtime publications
  BEGIN
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
             'name', p.pubname,
             'insert', p.pubinsert,
             'update', p.pubupdate,
             'delete', p.pubdelete,
             'truncate', p.pubtruncate,
             'all_tables', p.puballtables
           ) ORDER BY p.pubname), '[]'::jsonb)
      INTO v_publications
      FROM pg_publication p;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
             'publication', pt.pubname,
             'schema', pt.schemaname,
             'table', pt.tablename
           ) ORDER BY pt.pubname, pt.schemaname, pt.tablename), '[]'::jsonb)
      INTO v_realtime_tables
      FROM pg_publication_tables pt;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Cron jobs (pg_cron)
  BEGIN
    EXECUTE $q$
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
               'jobid', jobid,
               'jobname', jobname,
               'schedule', schedule,
               'command', command,
               'nodename', nodename,
               'nodeport', nodeport,
               'database', database,
               'username', username,
               'active', active
             ) ORDER BY jobid), '[]'::jsonb)
      FROM cron.job
    $q$ INTO v_cron_jobs;
  EXCEPTION WHEN OTHERS THEN v_cron_jobs := '[]'::jsonb; END;

  -- Auth providers (best-effort — reads what's actually been used)
  BEGIN
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
             'provider', provider,
             'user_count', c
           ) ORDER BY provider), '[]'::jsonb)
      INTO v_auth_providers
      FROM (
        SELECT provider, count(*) AS c
          FROM auth.identities
         GROUP BY provider
      ) x;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Applied migrations
  BEGIN
    EXECUTE $q$
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
               'version', version, 'name', name
             ) ORDER BY version), '[]'::jsonb)
      FROM supabase_migrations.schema_migrations
    $q$ INTO v_migrations;
  EXCEPTION WHEN OTHERS THEN v_migrations := '[]'::jsonb; END;

  -- Meta counts
  v_pg_version := current_setting('server_version', true);
  SELECT count(*) INTO v_table_count
    FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  BEGIN
    SELECT count(*) INTO v_user_count FROM auth.users;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  RETURN jsonb_build_object(
    'storage_buckets', v_storage_buckets,
    'policies', v_policies,
    'extensions', v_extensions,
    'publications', v_publications,
    'realtime_tables', v_realtime_tables,
    'cron_jobs', v_cron_jobs,
    'auth_providers', v_auth_providers,
    'migrations', v_migrations,
    'pg_version', v_pg_version,
    'total_tables', v_table_count,
    'total_buckets', v_bucket_count,
    'total_users', v_user_count,
    'total_files', v_file_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_export_extras() TO authenticated, service_role;
