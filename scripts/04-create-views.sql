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
    u.credits_used_total,
    u.created_at as user_since,
    u.last_login,
    COUNT(pj.id) as total_jobs,
    COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
    COALESCE(SUM(pj.processing_time_seconds), 0) as total_processing_time,
    COALESCE(SUM(pj.credits_used), 0) as total_credits_used_jobs
FROM users u
LEFT JOIN processing_jobs pj ON u.id = pj.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.email, u.name, u.role, u.subscription_tier, u.credits_remaining, u.credits_used_total, u.created_at, u.last_login;

-- Model performance view
CREATE OR REPLACE VIEW model_performance AS
SELECT 
    am.id,
    am.model_id,
    am.name,
    am.provider,
    am.category,
    am.status,
    COUNT(pj.id) as total_jobs,
    COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as successful_jobs,
    COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
    CASE 
        WHEN COUNT(pj.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN pj.status = 'completed' THEN 1 END)::DECIMAL / COUNT(pj.id)) * 100, 2)
        ELSE 0 
    END as success_rate,
    COALESCE(AVG(pj.processing_time_seconds), 0) as avg_processing_time,
    COALESCE(SUM(pj.credits_used), 0) as total_credits_consumed,
    MAX(pj.created_at) as last_used_at
FROM ai_models am
LEFT JOIN processing_jobs pj ON am.id = pj.model_id
GROUP BY am.id, am.model_id, am.name, am.provider, am.category, am.status;

-- Daily usage statistics
CREATE OR REPLACE VIEW daily_usage_stats AS
SELECT 
    DATE(pj.created_at) as date,
    COUNT(pj.id) as total_jobs,
    COUNT(CASE WHEN pj.status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN pj.status = 'failed' THEN 1 END) as failed_jobs,
    COUNT(DISTINCT pj.user_id) as active_users,
    COALESCE(SUM(pj.processing_time_seconds), 0) as total_processing_time,
    COALESCE(SUM(pj.credits_used), 0) as total_credits_used,
    COALESCE(AVG(pj.processing_time_seconds), 0) as avg_processing_time
FROM processing_jobs pj
WHERE pj.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(pj.created_at)
ORDER BY date DESC;

-- Active users view (last 30 days)
CREATE OR REPLACE VIEW active_users AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.subscription_tier,
    u.last_login,
    COUNT(pj.id) as jobs_last_30_days,
    MAX(pj.created_at) as last_job_date
FROM users u
LEFT JOIN processing_jobs pj ON u.id = pj.user_id AND pj.created_at >= CURRENT_DATE - INTERVAL '30 days'
WHERE u.status = 'active' AND (u.last_login >= CURRENT_DATE - INTERVAL '30 days' OR pj.id IS NOT NULL)
GROUP BY u.id, u.email, u.name, u.role, u.subscription_tier, u.last_login
ORDER BY u.last_login DESC;

-- System health view
CREATE OR REPLACE VIEW system_health AS
SELECT 
    'total_users' as metric,
    COUNT(*)::TEXT as value,
    'count' as unit
FROM users WHERE status = 'active'
UNION ALL
SELECT 
    'jobs_last_24h' as metric,
    COUNT(*)::TEXT as value,
    'count' as unit
FROM processing_jobs WHERE created_at >= NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'success_rate_24h' as metric,
    CASE 
        WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2)::TEXT
        ELSE '0'
    END as value,
    'percentage' as unit
FROM processing_jobs WHERE created_at >= NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'avg_processing_time_24h' as metric,
    COALESCE(ROUND(AVG(processing_time_seconds), 2), 0)::TEXT as value,
    'seconds' as unit
FROM processing_jobs WHERE created_at >= NOW() - INTERVAL '24 hours' AND status = 'completed';

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
