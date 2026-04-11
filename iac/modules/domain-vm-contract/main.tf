locals {
  vm_contract = {
    node_name      = var.node_name
    vm_id          = var.vm.id
    vm_name        = var.vm.name
    template       = var.vm.template
    cpu_cores      = var.vm.cpu_cores
    cpu_sockets    = var.vm.cpu_sockets
    memory_mb      = var.vm.memory_mb
    disk_gb        = var.vm.disk_gb
    storage_pool   = var.vm.storage_pool
    bridge         = var.vm.bridge
    ci_user        = var.vm.ci_user
    ssh_public_key = var.vm.ssh_public_key
    ipconfig0      = "ip=${var.vm.ip_cidr},gw=${var.vm.gateway}"
    nameserver     = try(var.vm.nameserver, null)
    search_domain  = try(var.vm.search_domain, null)
    balloon_mb     = try(var.vm.balloon_mb, 0)
    start_on_boot  = try(var.vm.start_on_boot, true)
    agent_enabled  = try(var.vm.agent_enabled, true)
  }

  snapshot_contract = {
    enabled          = var.snapshot_schedule.enabled
    minute           = var.snapshot_schedule.minute
    hour             = var.snapshot_schedule.hour
    retention        = var.snapshot_schedule.retention
    ssh_host         = var.snapshot_schedule.ssh_host
    ssh_port         = try(var.snapshot_schedule.ssh_port, 22)
    ssh_user         = var.snapshot_schedule.ssh_user
    ssh_private_key  = var.snapshot_schedule.ssh_private_key
    cron_identifier  = try(var.snapshot_schedule.cron_identifier, "nightly-vm-snapshot")
    snapshot_prefix  = try(var.snapshot_schedule.snapshot_prefix, "nightly")
    snapshot_comment = try(var.snapshot_schedule.snapshot_comment, "nightly snapshot via terraform")
  }
}
