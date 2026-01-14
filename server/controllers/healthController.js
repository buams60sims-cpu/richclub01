const mongoose = require('mongoose');

/**
 * Health Controller
 * PRODUCTION-GRADE health check with DB status
 */

const getHealthStatus = (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        const isHealthy = dbStatus === 'connected';

        const healthData = {
            status: isHealthy ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0',
            db: dbStatus,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB'
            }
        };

        res.status(isHealthy ? 200 : 503).json(healthData);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            error: error.message
        });
    }
};

module.exports = {
    getHealthStatus
};
