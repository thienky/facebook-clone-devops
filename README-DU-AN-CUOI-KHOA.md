# Dự án cuối khóa DevOps — Facebook Clone (đủ 3 tầng + DevOps)

Tài liệu đề: `14-01-2026-04-46-05-du-an-cuoi-khoa.pdf`  
Mẫu triển khai: [vulebaolong/devops_04](https://github.com/vulebaolong/devops_04)

## Kiến trúc (đúng tinh thần đề bài)

| Tầng | Công nghệ | Thư mục |
|------|-----------|---------|
| Frontend | React + Vite + Axios | `facebook-clone-fe/` |
| Backend | NestJS (API) | `facebook-clone-core/` |
| Database | PostgreSQL (+ Redis, ES, RabbitMQ) | `docker-compose.yml` |

Đề mẫu dùng Express + MongoDB; dự án này dùng **NestJS + PostgreSQL** (được phép nếu FULL stack và triển khai end-to-end). Giám sát DB qua **postgres_exporter**.

## Checklist yêu cầu đề

| Yêu cầu | File / lệnh |
|---------|-------------|
| Docker, Dockerfile, docker-compose | `docker-compose.yml`, `*/Dockerfile` |
| GitHub Actions CI/CD | `.github/workflows/ci.yml`, `cd-production.yml`, `cd-staging.yml`, `deploy-docker-hub.yml` |
| Jenkins pipeline | `Jenkinsfile` |
| Grafana + Prometheus (CPU/RAM + DB) | `docker-compose.yml` (grafana/prometheus), dashboard `observability/grafana/...` |
| Terraform tạo VPS | `terraform/create-ec2/` |
| Ansible cài đặt + deploy | `ansible/` (+ Jenkins: `playbook-install-jenkins.yml`) |

## Flow: Localhost → Docker Desktop → VPS

### 1. Localhost (dev)

```bash
# Backend
cd facebook-clone-core
cp .env.production.example .env.production
npm ci && npm run start:dev

# Frontend (terminal khác)
cd facebook-clone-fe
cp .env.example .env
npm ci && npm run dev
```

- FE: http://localhost:5173  
- API: http://localhost:3301 — Swagger: http://localhost:3301/api  

### 2. Docker Desktop (full stack)

Từ thư mục gốc repo:

```bash
cd facebook-clone-core && cp .env.production.example .env.production
cd ..
docker compose up -d --build
```

- FE: http://localhost:3001 (Axios gọi API qua Nginx cùng origin — mở bằng IP LAN/VPS vẫn được)  
- API trực tiếp: http://localhost:3301  
- Grafana: http://localhost:3000 (admin / admin)  
- Prometheus: http://localhost:9090  

Trên **VPS Linux**, thêm node exporter (CPU/RAM host):

```bash
docker compose --profile linux-host up -d node_exporter
```

### 3. VPS

```bash
cd terraform/create-ec2
terraform init
terraform apply -var="ssh_key_name=YOUR_KEY"

# Cập nhật ansible/inventory.ini bằng IP output
cd ../../ansible
ansible-playbook -i inventory.ini playbook-install-docker.yml
ansible-playbook -i inventory.ini playbook-install-nginx.yaml
ansible-playbook -i inventory.ini playbook-deploy-facebook-clone.yml -e "git_repo_url=..."
```

## GitHub Secrets

| Secret | Dùng cho |
|--------|----------|
| `SSH_KEY`, `SSH_USER`, `IP_SERVER_RUN` | Production CD |
| `SSH_KEY_STAGING`, `SSH_USER_STAGING`, `SSH_IP_STAGING` | Staging CD |
| `VITE_API_URL` | URL API khi build FE (VD: `http://103.x.x.x:3301`) |
| `DOCKER_USER`, `DOCKER_PASS` | Push Docker Hub |

## Nộp bài

Push **toàn bộ repo** lên GitHub (app + DevOps) và nộp link trên hệ thống Cybersoft.
