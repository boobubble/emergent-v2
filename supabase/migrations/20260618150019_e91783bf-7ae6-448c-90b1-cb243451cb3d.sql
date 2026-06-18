CREATE POLICY "Moderators can delete messages"
ON public.messages
FOR DELETE
TO authenticated
USING (public.is_moderator(auth.uid()));