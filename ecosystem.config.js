// PM2 Ecosystem Configuration for 100 Instances
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    // Generate 100 instances with unique ports and IDs
    ...Array.from({ length: 100 }, (_, i) => ({
      name: `erp-instance-${i + 1}`,
      script: './dist/server/index.js',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment variables for each instance
      env: {
        NODE_ENV: 'production',
        PORT: 5000 + i + 1,
        INSTANCE_ID: `instance-${i + 1}`,
      },
      
      // Resource limits
      max_memory_restart: '512M',
      
      // Error handling
      error_file: `./logs/err-instance-${i + 1}.log`,
      out_file: `./logs/out-instance-${i + 1}.log`,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto-restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    })),
  ],
};
