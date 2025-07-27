module.exports = {
  apps: [    {
      // Next.js application
      name: "metal-vault-app",
      script: "npm",
      args: "start",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/app-error.log",
      out_file: "./logs/app-out.log",
      log_file: "./logs/app-combined.log",
      time: true,
    },    {
      // GraphQL Worker 
      name: "metal-vault-worker",
      script: "npm",
      args: "run worker:start",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/worker-error.log",
      out_file: "./logs/worker-out.log",
      log_file: "./logs/worker-combined.log",
      time: true,
    },
  ],
};
