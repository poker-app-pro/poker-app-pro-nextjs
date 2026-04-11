resource "proxmox_vm_qemu" "ubuntu" {
  target_node = var.node_name
  vmid        = var.vm_id
  name        = var.vm_name

  clone       = var.template
  full_clone  = true
  onboot      = var.start_on_boot
  agent       = var.agent_enabled ? 1 : 0

  sockets     = var.cpu_sockets
  cores       = var.cpu_cores
  memory      = var.memory_mb
  balloon     = var.balloon_mb

  os_type     = "cloud-init"
  ciuser      = var.ci_user
  sshkeys     = var.ssh_public_key
  ipconfig0   = var.ipconfig0
  nameserver  = var.nameserver
  searchdomain = var.search_domain

  scsihw      = "virtio-scsi-pci"
  bootdisk    = "scsi0"

  disks {
    scsi {
      scsi0 {
        disk {
          size    = "${var.disk_gb}G"
          storage = var.storage_pool
        }
      }
    }
  }

  network {
    id     = 0
    model  = "virtio"
    bridge = var.bridge
  }
}
