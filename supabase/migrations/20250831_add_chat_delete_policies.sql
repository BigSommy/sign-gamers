-- Migration: Add DELETE policies for chat_messages
-- Created: 2025-08-31

-- Ensure RLS is enabled on chat_messages (should already be from earlier migration)
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to delete their own messages
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;
CREATE POLICY "Users can delete their own messages" ON public.chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Allow admins and moderators to delete any messages
DROP POLICY IF EXISTS "Admins or moderators can delete any messages" ON public.chat_messages;
CREATE POLICY "Admins or moderators can delete any messages" ON public.chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin','moderator')
    )
  );
