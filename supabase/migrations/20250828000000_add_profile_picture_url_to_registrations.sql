-- Add profile_picture_url column to registrations table
ALTER TABLE registrations
ADD COLUMN profile_picture_url TEXT;

-- Make it nullable since not all registrations might have a profile picture
COMMENT ON COLUMN registrations.profile_picture_url IS 'URL to the user''s profile picture, can be null';
