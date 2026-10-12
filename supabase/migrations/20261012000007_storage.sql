-- Migration 7: Storage Bucket Setup
-- Barakah Bazaar: Public bucket for product images

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true;

-- Policy: Allow public read of product images
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public Access to product-images'
  ) then
    create policy "Public Access to product-images"
      on storage.objects for select
      using (bucket_id = 'product-images');
  end if;
end
$$;
