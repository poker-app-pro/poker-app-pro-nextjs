module "proxmox_node_stack" {
  source = "./modules/application/proxmox-node-stack"

  node_name = var.node_name
  vm        = var.vm

  snapshot_schedule = var.snapshot_schedule
}
