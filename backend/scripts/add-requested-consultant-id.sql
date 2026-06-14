-- Add requested_consultant_id column to student_inquiries table
-- Run this script to enable storing the consultant selected by the student

ALTER TABLE student_inquiries
ADD COLUMN IF NOT EXISTS requested_consultant_id INT NULL AFTER consultant_id;

ALTER TABLE student_inquiries
ADD CONSTRAINT fk_student_inquiries_requested_consultant
FOREIGN KEY (requested_consultant_id) REFERENCES consultants(id) ON DELETE SET NULL;

-- Backfill requested_consultant_id for existing assigned inquiries
UPDATE student_inquiries
SET requested_consultant_id = consultant_id
WHERE consultant_id IS NOT NULL AND requested_consultant_id IS NULL;


