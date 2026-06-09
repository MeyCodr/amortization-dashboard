module.exports = {
  apps: [
    {
      name: "amortization-dashboard",
      script: "node_modules/.bin/next",
      args: "start -H 0.0.0.0 -p 3003",
      cwd: "/var/www/app/amortization-dashboard",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
