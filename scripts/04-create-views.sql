-- Create useful views for reporting and analytics

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.subscription_tier,
    u.credits_remaining,
    u.credits_used_total,
    u.total_images_processed,
    u.total_processing_time,
    u.created_at,
    u.last_login,
    COUNT(pj.id) as total_jobs,
    COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
    COUNT(CASE WHEN pj.status = 'processing' THEN 1 END) as active_jobs,
    COALESCE(AVG(CASE WHEN pj.status = 'completed' THEN pj.processing_time_seconds END), 0) as avg_processing_time,
    COALESCE(SUM(pj.credits_used), 0) as total_credits_used_jobs
FROM users u
LEFT JOIN processing_jobs pj ON u.id = pj.user_id
GROUP BY u.id, u.email, u.name, u.role, u.subscription_tier, u.credits_remaining, 
         u.credits_used_total, u.total_images_processed, u.total_processing_time, 
         u.created_at, u.last_login;

-- Model performance view
CREATE OR REPLACE VIEW model_performance AS
SELECT 
    m.id,
    m.model_id,
    m.name,
    m.category,
    m.provider,
    m.is_recommended,
    m.status,
    m.total_jobs_processed,
    m.success_rate,
    m.average_processing_time,
    m.last_used_at,
    COUNT(pj.id) as current_jobs,
    COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
    COUNT(CASE WHEN pj.status = 'processing' THEN 1 END) as active_jobs,
    COUNT(CASE WHEN pj.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as jobs_last_24h,
    COUNT(CASE WHEN pj.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as jobs_last_7d
FROM ai_models m
LEFT JOIN processing_jobs pj ON m.id = pj.model_id
GROUP BY m.id, m.model_id, m.name, m.category, m.provider, m.is_recommended, 
         m.status, m.total_jobs_processed, m.success_rate, m.average_processing_time, m.last_used_at;

-- Daily usage statistics
CREATE OR REPLACE VIEW daily_usage_stats AS
SELECT 
    DATE(pj.created_at) as date,
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
    COUNT(DISTINCT pj.user_id) as unique_users,
    SUM(pj.credits_used) as total_credits_used,
    AVG(CASE WHEN pj.status = 'completed' THEN pj.processing_time_seconds END) as avg_processing_time,
    SUM(CASE WHEN pj.status = 'completed' THEN pj.processing_time_seconds END) as total_processing_time
FROM processing_jobs pj
WHERE pj.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(pj.created_at)
ORDER BY date DESC;

-- Active users view
CREATE OR REPLACE VIEW active_users AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.subscription_tier,
    u.last_login,
    COUNT(pj.id) as jobs_last_30d,
    SUM(pj.credits_used) as credits_used_last_30d,
    MAX(pj.created_at) as last_job_created
FROM users u
LEFT JOIN processing_jobs pj ON u.id = pj.user_id AND pj.created_at >= NOW() - INTERVAL '30 days'
WHERE u.last_login >= NOW() - INTERVAL '30 days' OR pj.id IS NOT NULL
GROUP BY u.id, u.email, u.name, u.role, u.subscription_tier, u.last_login
ORDER BY u.last_login DESC NULLS LAST;

-- System health view
CREATE OR REPLACE VIEW system_health AS
SELECT 
    'jobs' as metric_category,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
    ROUND(
        CASE WHEN COUNT(*) > 0 THEN 
            (COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)) * 100 
        ELSE 0 END, 2
    ) as success_rate_percentage
FROM processing_jobs
WHERE created_at >= NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
    'users' as metric_category,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
    COUNT(CASE WHEN last_login >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_active_count,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as new_signups_24h,
    0 as failed_count,
    0 as success_rate_percentage
FROM users;

-- Queue status view
CREATE OR REPLACE VIEW queue_status AS
SELECT 
    status,
    COUNT(*) as job_count,
    MIN(created_at) as oldest_job,
    MAX(created_at) as newest_job,
    AVG(EXTRACT(EPOCH FROM (NOW() - created_at))) as avg_wait_time_seconds
FROM processing_jobs
WHERE status IN ('pending', 'processing')
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'processing' THEN 1 
        WHEN 'pending' THEN 2 
        ELSE 3 
    END;
