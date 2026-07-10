CREATE OR REPLACE FUNCTION public.admin_validate_export_sql(_schema_sql text, _data_sql text DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  test_schema text := '_backup_restore_' || replace(gen_random_uuid()::text, '-', '_');
  schema_sql text;
  data_sql text;
  err_message text;
  err_detail text;
  err_hint text;
  err_context text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;

  EXECUTE format('CREATE SCHEMA %I', test_schema);

  schema_sql := COALESCE(_schema_sql, '');
  schema_sql := replace(schema_sql, 'public.', quote_ident(test_schema) || '.');
  schema_sql := replace(schema_sql, ' public ', ' ' || quote_ident(test_schema) || ' ');
  schema_sql := replace(schema_sql, '''public''', quote_literal(test_schema));
  schema_sql := replace(schema_sql, '''public.', quote_literal(test_schema || '.'));
  schema_sql := 'SET search_path = ' || quote_ident(test_schema) || ', pg_catalog;' || chr(10) || schema_sql;

  data_sql := COALESCE(_data_sql, '');
  IF data_sql <> '' THEN
    data_sql := replace(data_sql, 'public.', quote_ident(test_schema) || '.');
    data_sql := replace(data_sql, ' public ', ' ' || quote_ident(test_schema) || ' ');
    data_sql := replace(data_sql, '''public''', quote_literal(test_schema));
    data_sql := replace(data_sql, '''public.', quote_literal(test_schema || '.'));
  END IF;

  BEGIN
    EXECUTE schema_sql;
    IF data_sql <> '' THEN
      EXECUTE data_sql;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS
      err_message = MESSAGE_TEXT,
      err_detail = PG_EXCEPTION_DETAIL,
      err_hint = PG_EXCEPTION_HINT,
      err_context = PG_EXCEPTION_CONTEXT;
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', test_schema);
    RETURN jsonb_build_object(
      'ok', false,
      'missing_or_invalid_object', err_message,
      'referenced_by', err_context,
      'detail', err_detail,
      'hint', err_hint,
      'test_schema', test_schema
    );
  END;

  EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', test_schema);
  RETURN jsonb_build_object('ok', true, 'test_schema', test_schema);
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS
    err_message = MESSAGE_TEXT,
    err_detail = PG_EXCEPTION_DETAIL,
    err_hint = PG_EXCEPTION_HINT,
    err_context = PG_EXCEPTION_CONTEXT;
  BEGIN
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', test_schema);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN jsonb_build_object(
    'ok', false,
    'missing_or_invalid_object', err_message,
    'referenced_by', err_context,
    'detail', err_detail,
    'hint', err_hint,
    'test_schema', test_schema
  );
END $function$;

REVOKE ALL ON FUNCTION public.admin_validate_export_sql(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_validate_export_sql(text, text) TO authenticated, service_role;