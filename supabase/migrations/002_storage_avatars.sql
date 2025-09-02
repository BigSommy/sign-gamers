-- Create avatars storage bucket
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow read access to public
create policy "Public read access to avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Allow authenticated users to upload to their own folder
create policy "Users can upload their avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update/delete only their own files
create policy "Users can update own avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

