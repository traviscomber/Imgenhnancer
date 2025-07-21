-- Useful views for reporting and analytics

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.subscription_tier,
    u.credits_remaining,
    u.total_images_processed,
    u.created_at,
    u.last_login,
    COUNT(pj.id) as total_jobs,
    COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
    COALESCE(SUM(pj.credits_used), 0) as total_credits_used,
    COALESCE(AVG(pj.processing_time_seconds), 0) as avg_processing_time
FROM users u
LEFT JOIN processing_jobs pj ON u.id = pj.user_id
GROUP BY u.id, u.email, u.name, u.role, u.subscription_tier, u.credits_remaining, u.total_images_processed, u.created_at, u.last_login;

-- Model performance view
CREATE OR REPLACE VIEW model_performance AS
SELECT 
    am.id,
    am.model_id,
    am.name,
    am.category,
    am.provider,
    am.is_recommended,
    am.status,
    COUNT(pj.id) as total_jobs,
    COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as successful_jobs,
    COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
    CASE 
        WHEN COUNT(pj.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN pj.status = 'completed' THEN 1 END)::DECIMAL / COUNT(pj.id)) * 100, 2)
        ELSE 0 
    END as success_rate_percent,
    COALESCE(AVG(CASE WHEN pj.status = 'completed' THEN pj.processing_time_seconds END), 0) as avg_processing_time,
    COALESCE(SUM(pj.credits_used), 0) as total_credits_consumed
FROM ai_models am
LEFT JOIN processing_jobs pj ON am.id = pj.model_id
GROUP BY am.id, am.model_id, am.name, am.category, am.provider, am.is_recommended, am.status;

-- Daily usage statistics
CREATE OR REPLACE VIEW daily_usage_stats AS
SELECT 
    DATE(pj.created_at) as date,
    COUNT(pj.id) as total_jobs,
    COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
    COUNT(DISTINCT pj.user_id) as unique_users,
    COALESCE(SUM(pj.credits_used), 0) as total_credits_used,
    COALESCE(SUM(pj.processing_time_seconds), 0) as total_processing_time,
    COALESCE(AVG(pj.processing_time_seconds), 0) as avg_processing_time
FROM processing_jobs pj
WHERE pj.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(pj.created_at)
ORDER BY date DESC;

-- Active users view (users who have logged in or processed images in the last 30 days)
CREATE OR REPLACE VIEW active_users AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.subscription_tier,
    u.last_login,
    COUNT(pj.id) as recent_jobs,
    MAX(pj.created_at) as last_job_date
FROM users u
LEFT JOIN processing_jobs pj ON u.id = pj.user_id AND pj.created_at >= CURRENT_DATE - INTERVAL '30 days'
WHERE u.last_login >= CURRENT_DATE - INTERVAL '30 days' 
   OR pj.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.email, u.name, u.role, u.subscription_tier, u.last_login
ORDER BY COALESCE(u.last_login, MAX(pj.created_at)) DESC;

-- System health view
CREATE OR REPLACE VIEW system_health AS
SELECT 
    'total_users' as metric,
    COUNT(*)::TEXT as value,
    'count' as type
FROM users WHERE status = 'active'
UNION ALL
SELECT 
    'active_users_30d' as metric,
    COUNT(*)::TEXT as value,
    'count' as type
FROM active_users
UNION ALL
SELECT 
    'total_jobs_today' as metric,
    COUNT(*)::TEXT as value,
    'count' as type
FROM processing_jobs 
WHERE DATE(created_at) = CURRENT_DATE
UNION ALL
SELECT 
    'success_rate_today' as metric,
    CASE 
        WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 1)::TEXT || '%'
        ELSE '0%' 
    END as value,
    'percentage' as type
FROM processing_jobs 
WHERE DATE(created_at) = CURRENT_DATE
UNION ALL
SELECT 
    'avg_processing_time_today' as metric,
    COALESCE(ROUND(AVG(processing_time_seconds), 1), 0)::TEXT || 's' as value,
    'duration' as type
FROM processing_jobs 
WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed';
