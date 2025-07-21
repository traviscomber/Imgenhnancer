-- Demo data for testing the AI Image Enhancer

-- Insert demo users (passwords are hashed versions of 'password123')
INSERT INTO users (email, name, password_hash, role, subscription_tier, credits_remaining, email_verified, total_images_processed) VALUES
('admin@example.com', 'Admin User', '$2b$10$rOzJqQZQQQQQQQQQQQQQQu', 'admin', 'business', 1000, true, 50),
('demo@example.com', 'Demo User', '$2b$10$rOzJqQZQQQQQQQQQQQQQQu', 'user', 'pro', 200, true, 25),
('john@example.com', 'John Doe', '$2b$10$rOzJqQZQQQQQQQQQQQQQQu', 'user', 'free', 95, true, 5),
('jane@example.com', 'Jane Smith', '$2b$10$rOzJqQZQQQQQQQQQQQQQQu', 'user', 'pro', 150, true, 30)
ON CONFLICT (email) DO NOTHING;

-- Insert some demo processing jobs
DO $$
DECLARE
    admin_user_id UUID;
    demo_user_id UUID;
    john_user_id UUID;
    jane_user_id UUID;
    real_esrgan_model_id UUID;
    gfpgan_model_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@example.com';
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@example.com';
    SELECT id INTO john_user_id FROM users WHERE email = 'john@example.com';
    SELECT id INTO jane_user_id FROM users WHERE email = 'jane@example.com';
    
    -- Get model IDs
    SELECT id INTO real_esrgan_model_id FROM ai_models WHERE model_id = 'real-esrgan-4x';
    SELECT id INTO gfpgan_model_id FROM ai_models WHERE model_id = 'gfpgan-face';
    
    -- Insert demo jobs if users and models exist
    IF admin_user_id IS NOT NULL AND real_esrgan_model_id IS NOT NULL THEN
        INSERT INTO processing_jobs (user_id, original_filename, original_file_size, original_file_type, model_id, settings, upscale_factor, status, progress_percentage, processing_time_seconds, credits_used, completed_at) VALUES
        (admin_user_id, 'landscape.jpg', 2048576, 'image/jpeg', real_esrgan_model_id, '{"targetUse": "display", "format": "PNG"}'::jsonb, 4, 'completed', 100, 45, 2, NOW() - INTERVAL '2 hours'),
        (admin_user_id, 'portrait.png', 1536000, 'image/png', gfpgan_model_id, '{"targetUse": "print", "faceEnhance": true}'::jsonb, 2, 'completed', 100, 67, 3, NOW() - INTERVAL '1 hour');
    END IF;
    
    IF demo_user_id IS NOT NULL AND real_esrgan_model_id IS NOT NULL THEN
        INSERT INTO processing_jobs (user_id, original_filename, original_file_size, original_file_type, model_id, settings, upscale_factor, status, progress_percentage, processing_time_seconds, credits_used, completed_at) VALUES
        (demo_user_id, 'artwork.jpg', 3072000, 'image/jpeg', real_esrgan_model_id, '{"targetUse": "display", "format": "PNG"}'::jsonb, 4, 'completed', 100, 52, 2, NOW() - INTERVAL '30 minutes'),
        (demo_user_id, 'photo.jpg', 2560000, 'image/jpeg', real_esrgan_model_id, '{"targetUse": "print", "format": "TIFF"}'::jsonb, 2, 'processing', 75, NULL, 1, NULL);
    END IF;
    
    IF john_user_id IS NOT NULL AND real_esrgan_model_id IS NOT NULL THEN
        INSERT INTO processing_jobs (user_id, original_filename, original_file_size, original_file_type, model_id, settings, upscale_factor, status, error_message, credits_used) VALUES
        (john_user_id, 'test.jpg', 1024000, 'image/jpeg', real_esrgan_model_id, '{"targetUse": "display"}'::jsonb, 2, 'failed', 'File format not supported', 0);
    END IF;
END $$;

-- Insert demo usage analytics
DO $$
DECLARE
    demo_user_id UUID;
    john_user_id UUID;
    jane_user_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@example.com';
    SELECT id INTO john_user_id FROM users WHERE email = 'john@example.com';
    SELECT id INTO jane_user_id FROM users WHERE email = 'jane@example.com';
    
    IF demo_user_id IS NOT NULL THEN
        INSERT INTO usage_analytics (user_id, date, images_processed, credits_used, processing_time_total, models_used) VALUES
        (demo_user_id, CURRENT_DATE, 3, 5, 180, '{"real-esrgan-4x": 2, "gfpgan-face": 1}'::jsonb),
        (demo_user_id, CURRENT_DATE - 1, 2, 4, 120, '{"real-esrgan-4x": 2}'::jsonb),
        (demo_user_id, CURRENT_DATE - 2, 1, 2, 45, '{"real-esrgan-4x": 1}'::jsonb)
        ON CONFLICT (user_id, date) DO NOTHING;
    END IF;
    
    IF john_user_id IS NOT NULL THEN
        INSERT INTO usage_analytics (user_id, date, images_processed, credits_used, processing_time_total, models_used) VALUES
        (john_user_id, CURRENT_DATE, 1, 0, 0, '{}'::jsonb),
        (john_user_id, CURRENT_DATE - 3, 2, 4, 90, '{"real-esrgan-4x": 2}'::jsonb)
        ON CONFLICT (user_id, date) DO NOTHING;
    END IF;
END $$;

-- Insert demo system logs
DO $$
DECLARE
    admin_user_id UUID;
    demo_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@example.com';
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@example.com';
    
    INSERT INTO system_logs (user_id, action, resource_type, details, severity) VALUES
    (admin_user_id, 'user_login', 'authentication', '{"ip": "192.168.1.1", "success": true}'::jsonb, 'info'),
    (demo_user_id, 'job_created', 'processing_job', '{"model": "real-esrgan-4x", "upscale": 4}'::jsonb, 'info'),
    (demo_user_id, 'job_completed', 'processing_job', '{"processing_time": 45, "success": true}'::jsonb, 'info'),
    (NULL, 'system_startup', 'system', '{"version": "1.0.0", "environment": "production"}'::jsonb, 'info'),
    (NULL, 'model_discovery', 'ai_model', '{"provider": "replicate", "models_found": 4}'::jsonb, 'info');
END $$;

-- Insert demo system metrics
INSERT INTO system_metrics (metric_name, metric_value, metric_type, tags) VALUES
('jobs_processed_total', 150, 'counter', '{"period": "all_time"}'::jsonb),
('active_users', 25, 'gauge', '{"period": "30_days"}'::jsonb),
('avg_processing_time', 52.5, 'gauge', '{"unit": "seconds"}'::jsonb),
('success_rate', 94.2, 'gauge', '{"unit": "percentage"}'::jsonb),
('credits_consumed_total', 500, 'counter', '{"period": "all_time"}'::jsonb),
('storage_used_mb', 2048, 'gauge', '{"unit": "megabytes"}'::jsonb);

-- Update model statistics based on demo jobs
UPDATE ai_models SET 
    total_jobs_processed = (
        SELECT COUNT(*) FROM processing_jobs pj WHERE pj.model_id = ai_models.id
    ),
    success_rate = (
        SELECT CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN pj.status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0 
        END
        FROM processing_jobs pj WHERE pj.model_id = ai_models.id
    ),
    average_processing_time = (
        SELECT COALESCE(AVG(pj.processing_time_seconds), 0)::INTEGER
        FROM processing_jobs pj 
        WHERE pj.model_id = ai_models.id AND pj.status = 'completed'
    );

-- Create a demo API key for testing
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@example.com';
    
    IF demo_user_id IS NOT NULL THEN
        INSERT INTO api_keys (user_id, key_name, key_hash, key_prefix, permissions, rate_limit_per_hour) VALUES
        (demo_user_id, 'Demo API Key', '$2b$10$demokeyhashforexample', 'aie_demo', '["upload_images", "view_jobs", "download_results"]'::jsonb, 50)
        ON CONFLICT (key_hash) DO NOTHING;
    END IF;
END $$;
