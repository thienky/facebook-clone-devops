# Terraform — tạo VPS trên AWS

Theo flow mẫu [devops_04](https://github.com/vulebaolong/devops_04).

```bash
cd terraform/create-ec2
terraform fmt
terraform init
terraform validate
terraform plan -var="ssh_key_name=YOUR_AWS_KEY_NAME"
terraform apply -var="ssh_key_name=YOUR_AWS_KEY_NAME"
terraform output public_ip
```

Sau khi có IP, cập nhật `ansible/inventory.ini` rồi chạy Ansible.
