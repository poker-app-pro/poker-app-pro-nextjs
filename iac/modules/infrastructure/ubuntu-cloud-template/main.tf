locals {
  image_filename = basename(var.cloud_image_url)
  image_path     = "/var/lib/vz/template/cache/${local.image_filename}"
}

resource "null_resource" "ubuntu_cloud_template" {
  count = var.enabled ? 1 : 0

  triggers = {
    node_name       = var.node_name
    template_vmid   = tostring(var.template_vmid)
    template_name   = var.template_name
    storage_pool    = var.storage_pool
    cloud_image_url = var.cloud_image_url
    ci_user         = var.ci_user
    ssh_public_key  = var.ssh_public_key
    memory_mb       = tostring(var.memory_mb)
    cpu_cores       = tostring(var.cpu_cores)
    cpu_sockets     = tostring(var.cpu_sockets)
  }

  connection {
    type        = "ssh"
    host        = var.ssh_host
    port        = var.ssh_port
    user        = var.ssh_user
    private_key = var.ssh_private_key
  }

  provisioner "remote-exec" {
    inline = [
      "set -euo pipefail",
      "if [ ! -f '${local.image_path}' ]; then sudo wget -O '${local.image_path}' '${var.cloud_image_url}'; fi",
      "if ! sudo qm status ${var.template_vmid} >/dev/null 2>&1; then sudo qm create ${var.template_vmid} --name ${var.template_name} --memory ${var.memory_mb} --cores ${var.cpu_cores} --sockets ${var.cpu_sockets} --net0 virtio,bridge=vmbr0 --scsihw virtio-scsi-pci; fi",
      "sudo qm importdisk ${var.template_vmid} '${local.image_path}' ${var.storage_pool} --format qcow2 || true",
      "if ! sudo qm config ${var.template_vmid} | grep -q '^scsi0:'; then DISK_REF=$(sudo pvesm list ${var.storage_pool} | awk '/vm-${var.template_vmid}-disk-0/ {print $1; exit}'); sudo qm set ${var.template_vmid} --scsi0 \"${var.storage_pool}:$DISK_REF\"; fi",
      "sudo qm set ${var.template_vmid} --ide2 ${var.storage_pool}:cloudinit --boot c --bootdisk scsi0 --serial0 socket --vga serial0 --agent enabled=1",
      "sudo qm set ${var.template_vmid} --ciuser '${var.ci_user}' --sshkeys /dev/stdin <<'EOKEY'\n${var.ssh_public_key}\nEOKEY",
      "sudo qm template ${var.template_vmid}"
    ]
  }
}
