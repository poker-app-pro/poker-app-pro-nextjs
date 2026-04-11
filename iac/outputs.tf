output "template_managed" {
  description = "Whether Ubuntu cloud template is managed by this stack"
  value       = module.proxmox_node_stack.template_managed
}

output "template_name" {
  description = "Ubuntu cloud template used for cloning"
  value       = module.proxmox_node_stack.template_name
}

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
