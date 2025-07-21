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
    COALESCE(pj.jobs_completed, 0) as jobs_completed,
    COALESCE(pj.jobs_failed, 0) as jobs_failed,
    COALESCE(pj.jobs_processing, 0) as jobs_processing,
    COALESCE(pj.avg_processing_time, 0) as avg_processing_time,
    CASE 
        WHEN u.last_login > NOW() - INTERVAL '7 days' THEN 'active'
        WHEN u.last_login > NOW() - INTERVAL '30 days' THEN 'inactive'
        ELSE 'dormant'
    END as activity_status
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) FILTER (WHERE status = 'completed') as jobs_completed,
        COUNT(*) FILTER (WHERE status = 'failed') as jobs_failed,
        COUNT(*) FILTER (WHERE status IN ('processing', 'pending')) as jobs_processing,
        AVG(processing_time_seconds) FILTER (WHERE status = 'completed') as avg_processing_time
    FROM processing_jobs
    GROUP BY user_id
) pj ON u.id = pj.user_id;

-- Model performance view
CREATE OR REPLACE VIEW model_performance AS
SELECT 
    m.id,
    m.model_id,
    m.name,
    m.category,
    m.provider,
    m.status,
    m.is_recommended,
    COALESCE(pj.total_jobs, 0) as total_jobs,
    COALESCE(pj.completed_jobs, 0) as completed_jobs,
    COALESCE(pj.failed_jobs, 0) as failed_jobs,
    COALESCE(pj.success_rate, 0) as actual_success_rate,
    COALESCE(pj.avg_processing_time, 0) as avg_processing_time,
    COALESCE(pj.total_credits_used, 0) as total_credits_used,
    COALESCE(pj.last_used, NULL) as last_used
FROM ai_models m
LEFT JOIN (
    SELECT 
        model_id,
        COUNT(*) as total_jobs,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs,
        ROUND(
            (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
            2
        ) as success_rate,
        AVG(processing_time_seconds) FILTER (WHERE status = 'completed') as avg_processing_time,
        SUM(credits_used) as total_credits_used,
        MAX(completed_at) as last_used
    FROM processing_jobs
    GROUP BY model_id
) pj ON m.id = pj.model_id;

-- Daily usage statistics view
CREATE OR REPLACE VIEW daily_usage_stats AS
SELECT 
    date_trunc('day', created_at) as date,
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(credits_used) FILTER (WHERE status = 'completed') as total_credits_used,
    AVG(processing_time_seconds) FILTER (WHERE status = 'completed') as avg_processing_time,
    SUM(original_file_size) as total_input_size,
    SUM(enhanced_file_size) FILTER (WHERE status = 'completed') as total_output_size
FROM processing_jobs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date_trunc('day', created_at)
ORDER BY date DESC;

-- Active users view (users who have been active in the last 30 days)
CREATE OR REPLACE VIEW active_users AS
SELECT 
    u.*,
    COALESCE(recent_jobs.job_count, 0) as recent_job_count,
    COALESCE(recent_jobs.credits_used_recently, 0) as credits_used_recently,
    recent_jobs.last_job_date
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as job_count,
        SUM(credits_used) as credits_used_recently,
        MAX(created_at) as last_job_date
    FROM processing_jobs
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY user_id
) recent_jobs ON u.id = recent_jobs.user_id
WHERE u.last_login >= CURRENT_DATE - INTERVAL '30 days'
   OR recent_jobs.job_count > 0
ORDER BY COALESCE(u.last_login, recent_jobs.last_job_date) DESC;

-- System health view
CREATE OR REPLACE VIEW system_health AS
SELECT 
    'total_users' as metric,
    COUNT(*)::TEXT as value,
    'count' as type
FROM users
UNION ALL
SELECT 
    'active_users_7d' as metric,
    COUNT(*)::TEXT as value,
    'count' as type
FROM users 
WHERE last_login >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
    'jobs_last_24h' as metric,
    COUNT(*)::TEXT as value,
    'count' as type
FROM processing_jobs 
WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
UNION ALL
SELECT 
    'success_rate_7d' as metric,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
        2
    )::TEXT || '%' as value,
    'percentage' as type
FROM processing_jobs 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
    'avg_processing_time' as metric,
    ROUND(AVG(processing_time_seconds), 2)::TEXT || 's' as value,
    'duration' as type
FROM processing_jobs 
WHERE status = 'completed' 
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
    'total_credits_used' as metric,
    SUM(credits_used)::TEXT as value,
    'count' as type
FROM processing_jobs 
WHERE status = 'completed';

-- Job queue view for monitoring
CREATE OR REPLACE VIEW job_queue_status AS
SELECT 
    status,
    COUNT(*) as count,
    MIN(created_at) as oldest_job,
    MAX(created_at) as newest_job,
    AVG(EXTRACT(EPOCH FROM (NOW() - created_at))) as avg_age_seconds
FROM processing_jobs
WHERE status IN ('pending', 'processing')
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'processing' THEN 1 
        WHEN 'pending' THEN 2 
        ELSE 3 
    END;

COMMIT;
