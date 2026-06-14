-- Add new columns to student_inquiries table for storing additional inquiry form data
-- Run this SQL script to add the new columns

ALTER TABLE student_inquiries 
ADD COLUMN IF NOT EXISTS current_education VARCHAR(100) NULL AFTER additional_requirements;

ALTER TABLE student_inquiries 
ADD COLUMN IF NOT EXISTS english_proficiency VARCHAR(100) NULL AFTER current_education;

ALTER TABLE student_inquiries 
ADD COLUMN IF NOT EXISTS work_experience VARCHAR(50) NULL AFTER english_proficiency;



