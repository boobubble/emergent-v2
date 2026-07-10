CREATE OR REPLACE FUNCTION public.admin_export_metadata_v2()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ok boolean;
  _res jsonb;
  _db_size bigint;
  _total_rows bigint;
  _functions int;
  _views int;
  _mviews int;
  _triggers int;
  _indexes int;
  _fkeys int;
  _sequences int;
  _policies int;
  _storage_size bigint;
  _largest jsonb;
BEGIN
  SELECT public.is_admin(auth.uid()) INTO _ok;
  IF NOT COALESCE(_ok, false) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT pg_database_size(current_database()) INTO _db_size;

  SELECT COALESCE(SUM(reltuples)::bigint, 0)
    INTO _total_rows
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r' AND n.nspname = 'public';

  SELECT count(*) INTO _functions
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public';

  SELECT count(*) INTO _views FROM information_schema.views WHERE table_schema='public';
  SELECT count(*) INTO _mviews FROM pg_matviews WHERE schemaname='public';

  SELECT count(*) INTO _triggers
    FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE NOT t.tgisinternal AND n.nspname='public';

  SELECT count(*) INTO _indexes FROM pg_indexes WHERE schemaname='public';

  SELECT count(*) INTO _fkeys
    FROM information_schema.table_constraints
    WHERE table_schema='public' AND constraint_type='FOREIGN KEY';

  SELECT count(*) INTO _sequences FROM information_schema.sequences WHERE sequence_schema='public';

  SELECT count(*) INTO _policies FROM pg_policies WHERE schemaname IN ('public','storage');

  BEGIN
    SELECT COALESCE(SUM(COALESCE((metadata->>'size')::bigint, 0)), 0)
      INTO _storage_size FROM storage.objects;
  EXCEPTION WHEN OTHERS THEN _storage_size := 0;
  END;

  BEGIN
    SELECT to_jsonb(t) INTO _largest FROM (
      SELECT bucket_id AS name,
             COALESCE(SUM(COALESCE((metadata->>'size')::bigint,0)),0) AS size_bytes,
             count(*) AS file_count
      FROM storage.objects
      GROUP BY bucket_id
      ORDER BY size_bytes DESC
      LIMIT 1
    ) t;
  EXCEPTION WHEN OTHERS THEN _largest := NULL;
  END;

  _res := jsonb_build_object(
    'database_size_bytes', _db_size,
    'total_rows_estimate', _total_rows,
    'total_functions',    _functions,
    'total_views',        _views,
    'total_materialized_views', _mviews,
    'total_triggers',     _triggers,
    'total_indexes',      _indexes,
    'total_foreign_keys', _fkeys,
    'total_sequences',    _sequences,
    'total_policies',     _policies,
    'storage_total_size_bytes', _storage_size,
    'largest_bucket',     _largest
  );

  RETURN _res;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_export_metadata_v2() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_export_metadata_v2() TO authenticated, service_role;