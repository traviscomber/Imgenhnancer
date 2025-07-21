-- Seed demo data for testing and development

-- Generate some demo processing jobs
DO $$
DECLARE
    demo_user_id UUID;
    admin_user_id UUID;
    model_real_esrgan UUID;
    model_gfpgan UUID;
    i INTEGER;
BEGIN
    -- Get user IDs
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@example.com';
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@example.com';
    SELECT id INTO model_real_esrgan FROM ai_models WHERE model_id = 'real-esrgan-4x';
    SELECT id INTO model_gfpgan FROM ai_models WHERE model_id = 'gfpgan-face';
    
    -- Create some completed jobs for demo user
    FOR i IN 1..15 LOOP
        INSERT INTO processing_jobs (
            user_id, 
            original_filename, 
            original_file_size, 
            original_file_type,
            model_id,
            settings,
            status,
            upscale_factor,
            processing_time_seconds,
            credits_used,
            started_at,
            completed_at,
            created_at
        ) VALUES (
            demo_user_id,
            'demo_image_' || i || '.jpg',
            1024000 + (i * 50000),
            'image/jpeg',
            CASE WHEN i % 3 = 0 THEN model_gfpgan ELSE model_real_esrgan END,
            '{"upscaleFactor": ' || (2 + (i % 3)) || ', "targetUse": "display"}',
            'completed',
            2 + (i % 3),
            30 + (i * 5),
            10 + (i * 2),
            NOW() - INTERVAL '1 day' * i - INTERVAL '1 hour',
            NOW() - INTERVAL '1 day' * i - INTERVAL '30 minutes',
            NOW() - INTERVAL '1 day' * i - INTERVAL '2 hours'
        );
    END LOOP;
    
    -- Create some jobs for admin user
    FOR i IN 1..8 LOOP
        INSERT INTO processing_jobs (
            user_id, 
            original_filename, 
            original_file_size, 
            original_file_type,
            model_id,
            settings,
            status,
            upscale_factor,
            processing_time_seconds,
            credits_used,
            started_at,
            completed_at,
            created_at
        ) VALUES (
            admin_user_id,
            'admin_test_' || i || '.png',
            2048000 + (i * 100000),
            'image/png',
            model_real_esrgan,
            '{"upscaleFactor": 4, "targetUse": "print"}',
            'completed',
            4,
            45 + (i * 3),
            20,
            NOW() - INTERVAL '12 hours' - INTERVAL '1 hour' * i,
            NOW() - INTERVAL '12 hours' - INTERVAL '30 minutes' * i,
            NOW() - INTERVAL '12 hours' - INTERVAL '2 hours' * i
        );
    END LOOP;
    
    -- Create a few failed jobs
    INSERT INTO processing_jobs (
        user_id, 
        original_filename, 
        original_file_size, 
        original_file_type,
        model_id,
        settings,
        status,
        error_message,
        started_at,
        created_at
    ) VALUES 
    (demo_user_id, 'corrupted_image.jpg', 500000, 'image/jpeg', model_real_esrgan, '{"upscaleFactor": 2}', 'failed', 'Invalid image format', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
    (demo_user_id, 'too_large.tiff', 50000000, 'image/tiff', model_real_esrgan, '{"upscaleFactor": 4}', 'failed', 'File size exceeds limit', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours');
    
    -- Create a processing job
    INSERT INTO processing_jobs (
        user_id, 
        original_filename, 
        original_file_size, 
        original_file_type,
        model_id,
        settings,
        status,
        progress_message,
        progress_percentage,
        started_at,
        created_at
    ) VALUES (
        demo_user_id,
        'current_processing.jpg',
        1500000,
        'image/jpeg',
        model_real_esrgan,
        '{"upscaleFactor": 2, "targetUse": "display"}',
        'processing',
        'Enhancing image quality...',
        65,
        NOW() - INTERVAL '2 minutes',
        NOW() - INTERVAL '5 minutes'
    );
    
END $$;

-- Update user statistics based on the jobs we created
UPDATE users SET 
    images_processed = (
        SELECT COUNT(*) 
        FROM processing_jobs 
        WHERE user_id = users.id AND status = 'completed'
    ),
    credits_used = (
        SELECT COALESCE(SUM(credits_used), 0) 
        FROM processing_jobs 
        WHERE user_id = users.id AND status = 'completed'
    ),
    total_processing_time = (
        SELECT COALESCE(SUM(processing_time_seconds), 0) 
        FROM processing_jobs 
        WHERE user_id = users.id AND status = 'completed'
    ),
    credits_remaining = 1000 - (
        SELECT COALESCE(SUM(credits_used), 0) 
        FROM processing_jobs 
        WHERE user_id = users.id AND status = 'completed'
    );

-- Create some system logs
INSERT INTO system_logs (user_id, action, resource_type, resource_id, details, created_at)
SELECT 
    u.id,
    'user_login',
    'user',
    u.id::TEXT,
    '{"ip_address": "192.168.1.100", "user_agent": "Mozilla/5.0"}',
    NOW() - INTERVAL '1 day' * (random() * 7)
FROM users u
WHERE u.email IN ('demo@example.com', 'admin@example.com', 'user@example.com');

-- Create usage analytics for the past 7 days
INSERT INTO usage_analytics (user_id, date, images_processed, credits_used, processing_time_seconds, models_used)
SELECT 
    u.id,
    CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6),
    FLOOR(random() * 10)::INTEGER,
    FLOOR(random() * 50)::INTEGER,
    FLOOR(random() * 300)::INTEGER,
    '{"real-esrgan-4x": ' || FLOOR(random() * 5)::INTEGER || ', "gfpgan-face": ' || FLOOR(random() * 3)::INTEGER || '}'
FROM users u
WHERE u.email IN ('demo@example.com', 'admin@example.com')
ON CONFLICT (user_id, date) DO NOTHING;

COMMIT;
