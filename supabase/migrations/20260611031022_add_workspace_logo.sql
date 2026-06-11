-- Public bucket for workspace logos. Reads happen via public URL; writes go
-- through the service-role admin client, so no storage.objects RLS policies are
-- required. The bucket enforces format and size limits as defence in depth
-- alongside the application-layer validation.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workspace-logos',
  'workspace-logos',
  true,
  2097152, -- 2 MB
  array['image/png', 'image/jpeg']
)
on conflict (id) do nothing;
