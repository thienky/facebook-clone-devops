# Ansible

Theo [devops_04/ansible](https://github.com/vulebaolong/devops_04/tree/main/ansible).

## Thứ tự trên VPS mới

```bash
cd ansible

ansible myhosts -m ping -i inventory.ini

ansible-playbook -i inventory.ini playbook-install-docker.yml
ansible-playbook -i inventory.ini playbook-install-nginx.yaml -e "server_name=your.domain.com"
ansible-playbook -i inventory.ini playbook-install-jenkins.yml

ansible-playbook -i inventory.ini playbook-deploy-facebook-clone.yml \
  -e "git_repo_url=https://github.com/YOUR_USER/facebook-clone-core.git"
```

## Biến quan trọng

| Biến | Mô tả |
|------|--------|
| `git_repo_url` | Repo GitHub chứa toàn bộ dự án |
| `server_name` | Domain trỏ về VPS (Nginx) |

Trên VPS cần có `facebook-clone-core/.env.production` trước khi deploy (copy từ `.env.production.example`).

Trên Linux, bật metric phần cứng:

```bash
cd /home/ubuntu/facebook-clone-core
docker compose --profile linux-host up -d node_exporter
```
