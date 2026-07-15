
-- Storage upload hardening: server-side validation via BEFORE INSERT/UPDATE trigger on storage.objects
CREATE OR REPLACE FUNCTION public.enforce_storage_upload_policy()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_bucket text := NEW.bucket_id;
  v_name text := coalesce(NEW.name, '');
  v_ext text;
  v_mime text := lower(coalesce(NEW.metadata->>'mimetype', ''));
  v_size bigint := coalesce((NEW.metadata->>'size')::bigint, 0);
  v_max_size bigint;
  v_allowed_exts text[];
  v_allowed_mime_prefixes text[];
  -- Universally forbidden — regardless of bucket
  v_forbidden_exts text[] := ARRAY[
    'svg','html','htm','xhtml','xml',
    'js','mjs','cjs','jsx','ts','tsx',
    'exe','dll','so','dylib','bin','msi','app','apk','ipa','deb','rpm',
    'sh','bash','zsh','csh','bat','cmd','ps1','psm1','vbs','vbe','wsf','wsh','scr','com','pif',
    'php','phtml','php3','php4','php5','phar','jsp','jspx','asp','aspx','cgi','pl','py','rb',
    'jar','war','ear','class'
  ];
  v_forbidden_mimes text[] := ARRAY[
    'image/svg+xml','image/svg',
    'text/html','application/xhtml+xml','text/xml','application/xml',
    'text/javascript','application/javascript','application/ecmascript','application/x-javascript',
    'application/x-msdownload','application/x-msdos-program','application/x-executable',
    'application/x-sh','application/x-shellscript','application/x-bat',
    'application/x-httpd-php','application/x-php',
    'application/java-archive','application/java-vm',
    'application/vnd.microsoft.portable-executable','application/x-dosexec'
  ];
BEGIN
  -- Extract extension (lowercase, last segment)
  v_ext := lower(regexp_replace(v_name, '^.*\.([^./\\]+)$', '\1'));
  IF v_ext = v_name THEN v_ext := ''; END IF;

  -- Per-bucket policy
  IF v_bucket = 'avatars' THEN
    v_max_size := 5 * 1024 * 1024;
    v_allowed_exts := ARRAY['jpg','jpeg','png','webp','gif'];
    v_allowed_mime_prefixes := ARRAY['image/jpeg','image/png','image/webp','image/gif'];
  ELSIF v_bucket = 'brand-assets' THEN
    v_max_size := 10 * 1024 * 1024;
    v_allowed_exts := ARRAY['jpg','jpeg','png','webp','gif','ico','avif'];
    v_allowed_mime_prefixes := ARRAY['image/jpeg','image/png','image/webp','image/gif','image/x-icon','image/vnd.microsoft.icon','image/avif'];
  ELSIF v_bucket = 'dm-wallpapers' THEN
    v_max_size := 10 * 1024 * 1024;
    v_allowed_exts := ARRAY['jpg','jpeg','png','webp','gif','avif'];
    v_allowed_mime_prefixes := ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif'];
  ELSIF v_bucket = 'feed-media' THEN
    v_max_size := 100 * 1024 * 1024;
    v_allowed_exts := ARRAY['jpg','jpeg','png','webp','gif','avif','mp4','webm'];
    v_allowed_mime_prefixes := ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif','video/mp4','video/webm'];
  ELSIF v_bucket = 'stickers' THEN
    v_max_size := 2 * 1024 * 1024;
    v_allowed_exts := ARRAY['png','webp','gif'];
    v_allowed_mime_prefixes := ARRAY['image/png','image/webp','image/gif'];
  ELSE
    -- Unknown bucket: apply conservative default (images up to 10MB)
    v_max_size := 10 * 1024 * 1024;
    v_allowed_exts := ARRAY['jpg','jpeg','png','webp','gif'];
    v_allowed_mime_prefixes := ARRAY['image/jpeg','image/png','image/webp','image/gif'];
  END IF;

  -- 1) Reject universally forbidden extensions
  IF v_ext = ANY(v_forbidden_exts) THEN
    RAISE EXCEPTION 'Upload rejected: file type ".%" is not allowed for security reasons.', v_ext
      USING ERRCODE = 'check_violation';
  END IF;

  -- 2) Reject universally forbidden MIME types
  IF v_mime = ANY(v_forbidden_mimes) THEN
    RAISE EXCEPTION 'Upload rejected: content type "%" is not allowed for security reasons.', v_mime
      USING ERRCODE = 'check_violation';
  END IF;

  -- 3) Enforce per-bucket size limit (skip when size metadata is missing — e.g. resumable init rows)
  IF v_size > 0 AND v_size > v_max_size THEN
    RAISE EXCEPTION 'Upload rejected: file exceeds the % MB limit for this bucket.',
      round(v_max_size / 1024.0 / 1024.0)
      USING ERRCODE = 'check_violation';
  END IF;

  -- 4) Enforce per-bucket extension allow-list
  IF v_ext = '' OR NOT (v_ext = ANY(v_allowed_exts)) THEN
    RAISE EXCEPTION 'Upload rejected: file extension ".%" is not allowed here. Allowed: %.',
      v_ext, array_to_string(v_allowed_exts, ', ')
      USING ERRCODE = 'check_violation';
  END IF;

  -- 5) Enforce per-bucket MIME allow-list (when provided by the client)
  IF v_mime <> '' AND NOT (v_mime = ANY(v_allowed_mime_prefixes)) THEN
    RAISE EXCEPTION 'Upload rejected: content type "%" is not allowed in this bucket.', v_mime
      USING ERRCODE = 'check_violation';
  END IF;

  -- 6) Prevent MIME/extension spoofing — cross-check mime family vs extension
  IF v_mime <> '' THEN
    IF v_ext IN ('jpg','jpeg') AND v_mime NOT IN ('image/jpeg') THEN
      RAISE EXCEPTION 'Upload rejected: extension/content-type mismatch (% vs %).', v_ext, v_mime USING ERRCODE = 'check_violation';
    ELSIF v_ext = 'png' AND v_mime <> 'image/png' THEN
      RAISE EXCEPTION 'Upload rejected: extension/content-type mismatch (% vs %).', v_ext, v_mime USING ERRCODE = 'check_violation';
    ELSIF v_ext = 'webp' AND v_mime <> 'image/webp' THEN
      RAISE EXCEPTION 'Upload rejected: extension/content-type mismatch (% vs %).', v_ext, v_mime USING ERRCODE = 'check_violation';
    ELSIF v_ext = 'gif' AND v_mime <> 'image/gif' THEN
      RAISE EXCEPTION 'Upload rejected: extension/content-type mismatch (% vs %).', v_ext, v_mime USING ERRCODE = 'check_violation';
    ELSIF v_ext = 'avif' AND v_mime <> 'image/avif' THEN
      RAISE EXCEPTION 'Upload rejected: extension/content-type mismatch (% vs %).', v_ext, v_mime USING ERRCODE = 'check_violation';
    ELSIF v_ext = 'mp4' AND v_mime NOT IN ('video/mp4') THEN
      RAISE EXCEPTION 'Upload rejected: extension/content-type mismatch (% vs %).', v_ext, v_mime USING ERRCODE = 'check_violation';
    ELSIF v_ext = 'webm' AND v_mime NOT IN ('video/webm') THEN
      RAISE EXCEPTION 'Upload rejected: extension/content-type mismatch (% vs %).', v_ext, v_mime USING ERRCODE = 'check_violation';
    ELSIF v_ext IN ('ico') AND v_mime NOT IN ('image/x-icon','image/vnd.microsoft.icon') THEN
      RAISE EXCEPTION 'Upload rejected: extension/content-type mismatch (% vs %).', v_ext, v_mime USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_storage_upload_policy() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_storage_upload_policy ON storage.objects;
CREATE TRIGGER enforce_storage_upload_policy
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_storage_upload_policy();
