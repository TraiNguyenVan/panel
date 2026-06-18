# Pterodactyl Theme Installation & Setup Guide (OpenCode Theme)

> [!NOTE]
> This is a customized Pterodactyl Panel theme. For the original Pterodactyl Panel documentation and README, please refer to [README-ORIGINAL.md](README-ORIGINAL.md).

This guide explains how to install and configure the custom **OpenCode Theme** on your local Pterodactyl Panel (compatible with version `v1.12.3`).

---

## 1. Features Included

1. **Terminal-Native Theme**: Replaces standard fonts with monospace options (`Berkeley Mono`, `JetBrains Mono`, or `IBM Plex Mono`) and adds a polished terminal-like visual aesthetic (with unified Light & Dark modes).
2. **Terminal Text Resizing**: Adds dynamic, persistent font size adjustments directly in the server console window.
3. **Host RAM Monitoring**: Displays a live dashboard RAM utilization bar and a process list inspector showing the top memory-using processes on the host.

---

## 2. Installation Methods

Choose one of the two methods below to install the theme on your panel.

### Method A: Git Integration (For Developers/Administrators)

1. Add this repository as a remote and fetch the branch:
   ```bash
   git remote add opencode-theme https://github.com/TraiNguyenVan/panel.git
   git fetch opencode-theme
   ```
2. Merge the theme branch into your existing installation (or check it out directly):
   ```bash
   git checkout -b theme-merge v1.12.3
   git merge opencode-theme/feature/opencode-theme
   ```
3. Install dependencies and compile the production assets:
   ```bash
   yarn install --frozen-lockfile
   yarn build:production
   ```
4. Clear the Laravel caches:
   ```bash
   php artisan view:clear
   php artisan config:clear
   php artisan route:clear
   ```

---

### Method B: Pre-built Production Zip (Easiest)

If you don't have Node/Yarn installed on your panel host:

1. **Back up** your existing panel files:
   ```bash
   tar -czf panel-backup.tar.gz /var/www/pterodactyl
   ```
2. **Download the pre-compiled theme zip** containing all code modifications and Webpack assets.
3. **Unpack the zip archive** on top of your installation folder:
   ```bash
   unzip -o opencode-theme.zip -d /var/www/pterodactyl
   ```
4. **Set correct ownership** on the files:
   ```bash
   chown -R www-data:www-data /var/www/pterodactyl/*
   ```
5. **Flush Laravel Caches**:
   ```bash
   php artisan view:clear
   php artisan config:clear
   php artisan route:clear
   ```

---

## 3. Configuring the Host RAM Monitor

The live Host RAM monitor requires a script running on the host machine to extract RAM statistics and pipe them to the panel.

### Step 1: Deploy the Monitoring Script
Create a script named `monitor_ram.sh` on the host machine where your panel runs:
```bash
#!/bin/bash
# Extract the top 5 RAM consuming processes (RSS in KB) and write to panel storage
# Update the path to point to your panel's storage directory
ps -eo comm,rss --no-headers --sort=-rss | head -n 5 > /var/www/pterodactyl/storage/app/host_top_ram.txt
```

### Step 2: Configure Cron
Configure a cron task to update the RAM stats every minute:
1. Open crontab as root:
   ```bash
   crontab -e
   ```
2. Add the following line:
   ```cron
   * * * * * /path/to/monitor_ram.sh > /dev/null 2>&1
   ```

### Step 3: Docker Layouts (If applicable)
If you run the panel inside a Docker container (like Docker Compose), ensure the host storage directory is mounted inside the container under `/app/storage/` so the panel container can read `host_top_ram.txt`:
```yaml
    volumes:
      - "/srv/pterodactyl/logs/:/app/storage/logs"
      - "/var/www/pterodactyl/:/app/"
```
Also check that permissions allow the container web worker user (`nginx` or `www-data`) to read the generated text file.
