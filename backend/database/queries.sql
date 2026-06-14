-- Global Education Database Queries
-- This file contains commonly used SQL queries for the application

-- ==============================================
-- STUDENT QUERIES
-- ==============================================

-- Get student profile with statistics
SELECT 
    s.*,
    COUNT(si.id) as total_inquiries,
    COUNT(CASE WHEN si.status = 'completed' THEN 1 END) as completed_inquiries
FROM students s
LEFT JOIN student_inquiries si ON s.id = si.student_id
WHERE s.id = ?;

-- Get student inquiries with consultant details
SELECT 
    si.*,
    c.agency_name,
    c.contact_person,
    c.email as consultant_email,
    c.phone as consultant_phone,
    c.logo
FROM student_inquiries si
LEFT JOIN consultants c ON si.consultant_id = c.id
WHERE si.student_id = ?
ORDER BY si.created_at DESC;

-- ==============================================
-- CONSULTANT QUERIES
-- ==============================================

-- Get consultant profile with statistics
SELECT 
    c.*,
    AVG(r.rating) as average_rating,
    COUNT(r.id) as total_reviews,
    COUNT(si.id) as total_inquiries,
    COUNT(CASE WHEN si.status = 'completed' THEN 1 END) as completed_inquiries
FROM consultants c
LEFT JOIN reviews r ON c.id = r.consultant_id
LEFT JOIN student_inquiries si ON c.id = si.consultant_id
WHERE c.id = ?;

-- Get consultants with filters and sorting
SELECT 
    c.*,
    AVG(r.rating) as average_rating,
    COUNT(r.id) as total_reviews,
    GROUP_CONCAT(DISTINCT co.name) as countries_served,
    GROUP_CONCAT(DISTINCT cou.name) as courses_offered
FROM consultants c
LEFT JOIN reviews r ON c.id = r.consultant_id
LEFT JOIN consultant_countries cc ON c.id = cc.consultant_id
LEFT JOIN countries co ON cc.country_id = co.id
LEFT JOIN consultant_courses cco ON c.id = cco.consultant_id
LEFT JOIN courses cou ON cco.course_id = cou.id
WHERE c.status = 'approved'
    AND (? IS NULL OR co.code = ?)
    AND (? IS NULL OR cou.name LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR c.fee_min <= ?)
    AND (? IS NULL OR c.fee_max >= ?)
    AND (? IS NULL OR AVG(r.rating) >= ?)
GROUP BY c.id
ORDER BY 
    CASE WHEN ? = 'most-trusted' THEN AVG(r.rating) END DESC,
    CASE WHEN ? = 'lowest-fee' THEN c.fee_min END ASC,
    CASE WHEN ? = 'most-experienced' THEN c.experience_years END DESC,
    CASE WHEN ? = 'most-reviews' THEN COUNT(r.id) END DESC,
    c.created_at DESC;

-- Get consultant's recent reviews
SELECT 
    r.*,
    s.name as student_name,
    si.course_preference,
    si.country_preference
FROM reviews r
JOIN students s ON r.student_id = s.id
LEFT JOIN student_inquiries si ON r.inquiry_id = si.id
WHERE r.consultant_id = ? AND r.is_public = TRUE
ORDER BY r.created_at DESC
LIMIT 10;

-- ==============================================
-- LEAD MATCHING QUERIES
-- ==============================================

-- Find best matching consultants for a student inquiry
SELECT 
    c.*,
    AVG(r.rating) as average_rating,
    COUNT(r.id) as total_reviews,
    COUNT(si.id) as total_inquiries,
    COUNT(CASE WHEN si.status = 'completed' THEN 1 END) as completed_inquiries,
    -- Calculate match score
    (
        CASE WHEN cc.country_id IN (
            SELECT id FROM countries WHERE code = ?
        ) THEN 10 ELSE 0 END +
        CASE WHEN cco.course_id IN (
            SELECT id FROM courses WHERE name LIKE CONCAT('%', ?, '%')
        ) THEN 10 ELSE 0 END +
        CASE WHEN c.fee_min <= ? AND c.fee_max >= ? THEN 5 ELSE 0 END +
        CASE WHEN AVG(r.rating) >= 4.0 THEN 5 ELSE 0 END +
        CASE WHEN c.response_time_hours <= 24 THEN 3 ELSE 0 END +
        CASE WHEN c.is_featured = TRUE THEN 2 ELSE 0 END
    ) as match_score
FROM consultants c
LEFT JOIN reviews r ON c.id = r.consultant_id
LEFT JOIN student_inquiries si ON c.id = si.consultant_id
LEFT JOIN consultant_countries cc ON c.id = cc.consultant_id
LEFT JOIN consultant_courses cco ON c.id = cco.consultant_id
WHERE c.status = 'approved'
    AND c.is_verified = TRUE
GROUP BY c.id
HAVING match_score > 0
ORDER BY match_score DESC, average_rating DESC
LIMIT 5;

-- ==============================================
-- ADMIN QUERIES
-- ==============================================

-- Get dashboard statistics
SELECT 
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM consultants WHERE status = 'approved') as total_consultants,
    (SELECT COUNT(*) FROM student_inquiries) as total_inquiries,
    (SELECT COUNT(*) FROM student_inquiries WHERE status = 'completed') as completed_inquiries,
    (SELECT COUNT(*) FROM consultants WHERE status = 'pending') as pending_consultants,
    (SELECT SUM(commission_amount) FROM invoices WHERE payment_status = 'paid') as total_revenue;

-- Get pending consultant approvals
SELECT 
    c.*,
    COUNT(si.id) as total_inquiries,
    AVG(r.rating) as average_rating
FROM consultants c
LEFT JOIN student_inquiries si ON c.id = si.consultant_id
LEFT JOIN reviews r ON c.id = r.consultant_id
WHERE c.status = 'pending'
GROUP BY c.id
ORDER BY c.created_at ASC;

-- Get recent inquiries for admin
SELECT 
    si.*,
    s.name as student_name,
    s.email as student_email,
    s.phone as student_phone,
    c.agency_name,
    c.contact_person,
    c.email as consultant_email
FROM student_inquiries si
JOIN students s ON si.student_id = s.id
LEFT JOIN consultants c ON si.consultant_id = c.id
ORDER BY si.created_at DESC
LIMIT 50;

-- ==============================================
-- INVOICE QUERIES
-- ==============================================

-- Get consultant's invoices
SELECT 
    i.*,
    COUNT(ii.id) as total_matches
FROM invoices i
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
WHERE i.consultant_id = ?
GROUP BY i.id
ORDER BY i.created_at DESC;

-- Get invoice details with items
SELECT 
    i.*,
    ii.*,
    si.course_preference,
    si.country_preference
FROM invoices i
JOIN invoice_items ii ON i.id = ii.invoice_id
LEFT JOIN student_inquiries si ON ii.inquiry_id = si.id
WHERE i.id = ?
ORDER BY ii.created_at ASC;

-- ==============================================
-- ANALYTICS QUERIES
-- ==============================================

-- Get monthly statistics
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as month,
    COUNT(*) as total_inquiries,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_inquiries,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_inquiries
FROM student_inquiries
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month DESC;

-- Get top performing consultants
SELECT 
    c.id,
    c.agency_name,
    COUNT(si.id) as total_inquiries,
    COUNT(CASE WHEN si.status = 'completed' THEN 1 END) as completed_inquiries,
    AVG(r.rating) as average_rating,
    COUNT(r.id) as total_reviews
FROM consultants c
LEFT JOIN student_inquiries si ON c.id = si.consultant_id
LEFT JOIN reviews r ON c.id = r.consultant_id
WHERE c.status = 'approved'
    AND si.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
GROUP BY c.id
ORDER BY completed_inquiries DESC, average_rating DESC
LIMIT 10;

-- Get country-wise statistics
SELECT 
    co.name as country,
    COUNT(si.id) as total_inquiries,
    COUNT(CASE WHEN si.status = 'completed' THEN 1 END) as completed_inquiries
FROM countries co
LEFT JOIN consultant_countries cc ON co.id = cc.country_id
LEFT JOIN student_inquiries si ON cc.consultant_id = si.consultant_id
WHERE si.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY co.id, co.name
ORDER BY total_inquiries DESC;

-- ==============================================
-- SEARCH QUERIES
-- ==============================================

-- Search consultants with full-text search
SELECT 
    c.*,
    AVG(r.rating) as average_rating,
    COUNT(r.id) as total_reviews,
    MATCH(c.agency_name, c.description) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance_score
FROM consultants c
LEFT JOIN reviews r ON c.id = r.consultant_id
WHERE c.status = 'approved'
    AND (
        MATCH(c.agency_name, c.description) AGAINST(? IN NATURAL LANGUAGE MODE)
        OR c.agency_name LIKE CONCAT('%', ?, '%')
        OR c.description LIKE CONCAT('%', ?, '%')
    )
GROUP BY c.id
ORDER BY relevance_score DESC, average_rating DESC;

-- ==============================================
-- MAINTENANCE QUERIES
-- ==============================================

-- Clean up expired tokens
DELETE FROM students WHERE reset_token_expires < NOW() AND reset_token IS NOT NULL;

-- Update consultant statistics
UPDATE consultants c
SET 
    total_placements = (
        SELECT COUNT(*) 
        FROM student_inquiries si 
        WHERE si.consultant_id = c.id AND si.status = 'completed'
    ),
    success_rate = (
        SELECT 
            CASE 
                WHEN COUNT(*) > 0 THEN 
                    (COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*))
                ELSE 0 
            END
        FROM student_inquiries si 
        WHERE si.consultant_id = c.id
    );

-- Archive old audit logs (older than 1 year)
DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);








