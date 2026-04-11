output "vm_id" {
  description = "Created Ubuntu VM ID"
  value       = module.proxmox_node_stack.vm_id
}

output "vm_name" {
  description = "Created Ubuntu VM name"
  value       = module.proxmox_node_stack.vm_name
}

output "snapshot_cron_installed" {
  description = "Whether nightly snapshot cron job is configured"
  value       = module.proxmox_node_stack.snapshot_cron_installed
}
