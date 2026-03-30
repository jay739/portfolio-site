#!/bin/bash

# Setup Networks Script
# Creates all required networks for the docker_services stack
# Based on service analysis and security considerations

echo "Creating Docker networks..."

# Proxy Network (Critical for NPM and exposed services)
# Used by: nginx-proxy-manager, netdata, portfolio, nextcloud, uptime-kuma, portainer, 
# authelia, redis, pihole, homarr, vscode, open-webui, drupal, vaultwarden, theme-park,
# audiobookshelf, jellyfin, qbittorrent, nicotine, navidrome, flood, sonarr, radarr, lidarr, comfyui
echo "Creating proxy_net..."
docker network create --driver bridge \
  --subnet 172.28.0.0/24 \
  --gateway 172.28.0.1 \
  --label "traefik.enable=false" \
  --label "persist=true" \
  --label "category=proxy" \
  proxy_net

# Core Services Network (DBs, Nextcloud, Drupal)
# Used by: mariadb, nextcloud, drupal
# INTERNAL: true for database security
echo "Creating core_net..."
docker network create --driver bridge \
  --subnet 172.19.0.0/24 \
  --internal \
  --label "type=database" \
  --label "category=core" \
  core_net

# Media Network (Jellyfin, qBittorrent, etc.)
# Used by: jellyfin, qbittorrent, nicotine, navidrome, audiobookshelf, flood, sonarr, radarr, lidarr
echo "Creating media_net..."
docker network create --driver bridge \
  --subnet 172.20.0.0/24 \
  --label "category=media" \
  media_net

# Infrastructure Network (Portainer, Watchtower, etc.)
# Used by: uptime-kuma, portainer, duckdns, pihole, homarr, vscode, open-webui, watchtower
echo "Creating infra_net..."
docker network create --driver bridge \
  --subnet 172.21.0.0/24 \
  --label "category=management" \
  infra_net

# AI Network (ComfyUI)
# Used by: comfyui
echo "Creating ai_net..."
docker network create --driver bridge \
  --subnet 172.22.0.0/24 \
  --label "category=ai" \
  ai_net

echo "All networks created successfully!"
echo ""
echo "Network Summary:"
echo "================="
echo "proxy_net  (172.28.0.0/24) - External services, proxy access"
echo "core_net   (172.19.0.0/24) - INTERNAL, databases and core services"
echo "media_net  (172.20.0.0/24) - Media services (Jellyfin, torrents, etc.)"
echo "infra_net  (172.21.0.0/24) - Infrastructure/management services"
echo "ai_net     (172.22.0.0/24) - AI/ML services"
echo ""
echo "Available networks:"
docker network ls --filter "name=^(proxy_net|core_net|media_net|infra_net|ai_net)$" 