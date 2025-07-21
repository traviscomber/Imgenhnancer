-- Create useful views for analytics and reporting

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.status,
    u.subscription_plan,
    u.credits_remaining,
    u.credits_used,
    u.images_processed,
    u.total_processing_time,
    u.created_at,
    u.last_login,
    COUNT(pj.id) as total_jobs,
    COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
    AVG(CASE WHEN pj.status = 'completed' THEN pj.processing_time_seconds END) as avg_processing_time,
    SUM(CASE WHEN pj.status = 'completed' THEN pj.credits_used ELSE 0 END) as total_credits_spent
FROM users u
LEFT JOIN processing_jobs pj ON u.id = pj.user_id
GROUP BY u.id, u.email, u.name, u.role, u.status, u.subscription_plan, 
         u.credits_remaining, u.credits_used, u.images_processed, 
         u.total_processing_time, u.created_at, u.last_login;

-- Model performance view
CREATE OR REPLACE VIEW model_performance AS
SELECT 
    am.id,
    am.model_id,
    am.name,
    am.category,
    am.provider,
    am.status,
    am.is_recommended,
    COUNT(pj.id) as total_uses,
    COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as successful_uses,
    COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_uses,
    ROUND(
        (COUNT(CASE WHEN pj.status = 'completed' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(pj.id), 0)) * 100, 2
    ) as success_rate_calculated,
    AVG(CASE WHEN pj.status = 'completed' THEN pj.processing_time_seconds END) as avg_processing_time,
    MIN(CASE WHEN pj.status = 'completed' THEN pj.processing_time_seconds END) as min_processing_time,
    MAX(CASE WHEN pj.status = 'completed' THEN pj.processing_time_seconds END) as max_processing_time,
    SUM(CASE WHEN pj.status = 'completed' THEN pj.credits_used ELSE 0 END) as total_credits_generated
FROM ai_models am
LEFT JOIN processing_jobs pj ON am.id = pj.model_id
GROUP BY am.id, am.model_id, am.name, am.category, am.provider, am.status, am.is_recommended;

-- Daily usage statistics view
CREATE OR REPLACE VIEW daily_usage_stats AS
SELECT 
    DATE(pj.created_at) as usage_date,
    COUNT(pj.id) as total_jobs,
    COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
    COUNT(CASE WHEN pj.status = 'processing' THEN 1 END) as processing_jobs,
    COUNT(DISTINCT pj.user_id) as unique_users,
    SUM(CASE WHEN pj.status = 'completed' THEN pj.credits_used ELSE 0 END) as total_credits_used,
    AVG(CASE WHEN pj.status = 'completed' THEN pj.processing_time_seconds END) as avg_processing_time,
    SUM(CASE WHEN pj.status = 'completed' THEN pj.original_file_size ELSE 0 END) as total_input_size,
    SUM(CASE WHEN pj.status = 'completed' THEN pj.enhanced_file_size ELSE 0 END) as total_output_size
FROM processing_jobs pj
GROUP BY DATE(pj.created_at)
ORDER BY usage_date DESC;

-- Active users view (users who have processed images in the last 30 days)
CREATE OR REPLACE VIEW active_users AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.subscription_plan,
    COUNT(pj.id) as recent_jobs,
    MAX(pj.created_at) as last_job_date,
    SUM(CASE WHEN pj.status = 'completed' THEN pj.credits_used ELSE 0 END) as recent_credits_used
FROM users u
INNER JOIN processing_jobs pj ON u.id = pj.user_id
WHERE pj.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, u.name, u.role, u.subscription_plan
ORDER BY recent_jobs DESC;

-- System health view
CREATE OR REPLACE VIEW system_health AS
SELECT 
    'total_users' as metric,
    COUNT(*)::TEXT as value,
    'users' as unit
FROM users
UNION ALL
SELECT 
    'active_users_30d' as metric,
    COUNT(DISTINCT pj.user_id)::TEXT as value,
    'users' as unit
FROM processing_jobs pj
WHERE pj.created_at >= NOW() - INTERVAL '30 days'
UNION ALL
SELECT 
    'total_jobs' as metric,
    COUNT(*)::TEXT as value,
    'jobs' as unit
FROM processing_jobs
UNION ALL
SELECT 
    'jobs_today' as metric,
    COUNT(*)::TEXT as value,
    'jobs' as unit
FROM processing_jobs
WHERE DATE(created_at) = CURRENT_DATE
UNION ALL
SELECT 
    'success_rate_7d' as metric,
    ROUND(
        (COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(*), 0)) * 100, 1
    )::TEXT as value,
    '%' as unit
FROM processing_jobs
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
    'avg_processing_time_7d' as metric,
    ROUND(AVG(CASE WHEN status = 'completed' THEN processing_time_seconds END), 1)::TEXT as value,
    'seconds' as unit
FROM processing_jobs
WHERE created_at >= NOW() - INTERVAL '7 days';

COMMIT;
