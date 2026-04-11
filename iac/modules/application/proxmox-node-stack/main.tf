module "domain_contract" {
  source = "../../domain-vm-contract"

  node_name         = var.node_name
  vm                = var.vm
  snapshot_schedule = var.snapshot_schedule
}

module "ubuntu_vm" {
  source = "../../infrastructure/proxmox-ubuntu-vm"

  node_name      = module.domain_contract.vm_contract.node_name
  vm_id          = module.domain_contract.vm_contract.vm_id
  vm_name        = module.domain_contract.vm_contract.vm_name
  template       = module.domain_contract.vm_contract.template
  cpu_cores      = module.domain_contract.vm_contract.cpu_cores
  cpu_sockets    = module.domain_contract.vm_contract.cpu_sockets
  memory_mb      = module.domain_contract.vm_contract.memory_mb
  disk_gb        = module.domain_contract.vm_contract.disk_gb
  storage_pool   = module.domain_contract.vm_contract.storage_pool
  bridge         = module.domain_contract.vm_contract.bridge
  ci_user        = module.domain_contract.vm_contract.ci_user
  ssh_public_key = module.domain_contract.vm_contract.ssh_public_key
  ipconfig0      = module.domain_contract.vm_contract.ipconfig0
  nameserver     = module.domain_contract.vm_contract.nameserver
  search_domain  = module.domain_contract.vm_contract.search_domain
  balloon_mb     = module.domain_contract.vm_contract.balloon_mb
  start_on_boot  = module.domain_contract.vm_contract.start_on_boot
  agent_enabled  = module.domain_contract.vm_contract.agent_enabled
}

module "nightly_snapshot_cron" {
  source = "../../infrastructure/nightly-snapshot-cron"

  enabled          = module.domain_contract.snapshot_contract.enabled
  minute           = module.domain_contract.snapshot_contract.minute
  hour             = module.domain_contract.snapshot_contract.hour
  retention        = module.domain_contract.snapshot_contract.retention
  vm_id            = module.ubuntu_vm.vm_id
  ssh_host         = module.domain_contract.snapshot_contract.ssh_host
  ssh_port         = module.domain_contract.snapshot_contract.ssh_port
  ssh_user         = module.domain_contract.snapshot_contract.ssh_user
  ssh_private_key  = module.domain_contract.snapshot_contract.ssh_private_key
  cron_identifier  = module.domain_contract.snapshot_contract.cron_identifier
  snapshot_prefix  = module.domain_contract.snapshot_contract.snapshot_prefix
  snapshot_comment = module.domain_contract.snapshot_contract.snapshot_comment

  depends_on = [module.ubuntu_vm]
}
