-- Demo data for testing

-- Insert sample AI models
INSERT INTO ai_models (model_id, name, description, category, provider, provider_model_name, provider_version, max_upscale, processing_time_estimate, credits_per_use, best_for, is_recommended, icon_name, configuration) VALUES
('real-esrgan-x4', 'Real-ESRGAN 4x', 'High-quality image upscaling using Real-ESRGAN', 'upscaling', 'replicate', 'nightmareai/real-esrgan', 'latest', 4, 45, 2, ARRAY['photos', 'artwork', 'general'], true, 'Zap', '{"scale": 4, "face_enhance": false}'),
('gfpgan-face', 'GFPGAN Face Restoration', 'AI-powered face restoration and enhancement', 'restoration', 'replicate', 'tencentarc/gfpgan', 'latest', 2, 30, 3, ARRAY['portraits', 'faces', 'old photos'], true, 'User', '{"version": "v1.4", "scale": 2}'),
('esrgan-general', 'ESRGAN General', 'General purpose image super-resolution', 'upscaling', 'replicate', 'xinntao/esrgan', 'latest', 4, 60, 2, ARRAY['general', 'artwork'], false, 'Image', '{"model_name": "RealESRGAN_x4plus"}'),
('waifu2x-anime', 'Waifu2x Anime', 'Specialized upscaling for anime and artwork', 'upscaling', 'replicate', 'logerzhu/waifu2x', 'latest', 2, 25, 1, ARRAY['anime', 'artwork', 'illustrations'], true, 'Sparkles', '{"scale": 2, "noise": 1}'),
('fal-upscaler', 'FAL AI Upscaler', 'Fast AI-powered image upscaling', 'upscaling', 'fal', 'fal-ai/imageutils/upscale', 'latest', 4, 20, 2, ARRAY['general', 'photos'], false, 'Zap', '{"upscale_factor": 4}')
ON CONFLICT (model_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Insert demo users
INSERT INTO users (email, name, password_hash, role, subscription_tier, credits_remaining, email_verified) VALUES
('admin@example.com', 'System Admin', '$2b$10$example_hash_admin', 'admin', 'enterprise', 1000, true),
('user@example.com', 'Demo User', '$2b$10$example_hash_user', 'user', 'free', 10, true),
('premium@example.com', 'Premium User', '$2b$10$example_hash_premium', 'premium', 'pro', 100, true)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- Insert sample processing jobs
DO $$
DECLARE
    admin_id UUID;
    user_id UUID;
    premium_id UUID;
    model_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_id FROM users WHERE email = 'admin@example.com';
    SELECT id INTO user_id FROM users WHERE email = 'user@example.com';
    SELECT id INTO premium_id FROM users WHERE email = 'premium@example.com';
    SELECT id INTO model_id FROM ai_models WHERE model_id = 'real-esrgan-x4';

    -- Insert sample jobs
    INSERT INTO processing_jobs (user_id, model_id, status, original_filename, original_file_size, original_file_type, upscale_factor, settings, processing_time_seconds, credits_used, progress_percentage) VALUES
    (user_id, model_id, 'completed', 'sample_photo.jpg', 1024000, 'image/jpeg', 4, '{"scale": 4}', 45, 2, 100),
    (user_id, model_id, 'processing', 'another_image.png', 2048000, 'image/png', 2, '{"scale": 2}', NULL, 0, 75),
    (premium_id, model_id, 'completed', 'artwork.jpg', 3072000, 'image/jpeg', 4, '{"scale": 4, "face_enhance": true}', 52, 3, 100),
    (premium_id, model_id, 'failed', 'corrupted.jpg', 512000, 'image/jpeg', 2, '{"scale": 2}', NULL, 0, 0);
END $$;

-- Insert sample usage analytics
DO $$
DECLARE
    user_id UUID;
    premium_id UUID;
BEGIN
    SELECT id INTO user_id FROM users WHERE email = 'user@example.com';
    SELECT id INTO premium_id FROM users WHERE email = 'premium@example.com';

    INSERT INTO usage_analytics (user_id, date, images_processed, credits_used, processing_time_total, models_used) VALUES
    (user_id, CURRENT_DATE, 2, 2, 45, '{"real-esrgan-x4": 2}'),
    (user_id, CURRENT_DATE - 1, 1, 2, 30, '{"real-esrgan-x4": 1}'),
    (premium_id, CURRENT_DATE, 3, 5, 120, '{"real-esrgan-x4": 2, "gfpgan-face": 1}'),
    (premium_id, CURRENT_DATE - 1, 2, 4, 90, '{"real-esrgan-x4": 2}');
END $$;

-- Insert sample system logs
DO $$
DECLARE
    user_id UUID;
    admin_id UUID;
BEGIN
    SELECT id INTO user_id FROM users WHERE email = 'user@example.com';
    SELECT id INTO admin_id FROM users WHERE email = 'admin@example.com';

    INSERT INTO system_logs (user_id, action, resource_type, details, severity) VALUES
    (user_id, 'user_login', 'authentication', '{"ip": "192.168.1.100", "user_agent": "Mozilla/5.0"}', 'info'),
    (user_id, 'job_created', 'processing_job', '{"model": "real-esrgan-x4", "filename": "sample_photo.jpg"}', 'info'),
    (user_id, 'job_completed', 'processing_job', '{"processing_time": 45, "credits_used": 2}', 'info'),
    (admin_id, 'admin_login', 'authentication', '{"ip": "10.0.0.1", "user_agent": "Mozilla/5.0"}', 'info'),
    (NULL, 'system_startup', 'system', '{"version": "1.0.0", "environment": "production"}', 'info');
END $$;

-- Insert sample system metrics
INSERT INTO system_metrics (metric_name, metric_value, metric_unit, tags) VALUES
('cpu_usage', 45.2, 'percentage', '{"server": "web-1"}'),
('memory_usage', 68.5, 'percentage', '{"server": "web-1"}'),
('disk_usage', 23.1, 'percentage', '{"server": "web-1", "mount": "/"}'),
('active_connections', 12, 'count', '{"database": "primary"}'),
('queue_length', 3, 'count', '{"queue": "image_processing"}'),
('response_time', 245.5, 'milliseconds', '{"endpoint": "/api/enhance"}');

-- Update model statistics based on sample jobs
UPDATE ai_models SET 
    total_jobs_processed = (
        SELECT COUNT(*) FROM processing_jobs WHERE model_id = ai_models.id
    ),
    success_rate = (
        SELECT CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0 
        END
        FROM processing_jobs WHERE model_id = ai_models.id
    ),
    average_processing_time = (
        SELECT COALESCE(AVG(processing_time_seconds), 0)
        FROM processing_jobs 
        WHERE model_id = ai_models.id AND status = 'completed'
    ),
    last_used_at = (
        SELECT MAX(created_at)
        FROM processing_jobs WHERE model_id = ai_models.id
    );

-- Create a sample API key
DO $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id FROM users WHERE email = 'premium@example.com';
    
    INSERT INTO api_keys (user_id, key_name, key_hash, key_prefix, permissions, rate_limit_per_hour) VALUES
    (user_id, 'Production API Key', '$2b$10$example_api_key_hash', 'aie_prod_', '{"enhance_images": true, "view_history": true}', 500);
END $$;
