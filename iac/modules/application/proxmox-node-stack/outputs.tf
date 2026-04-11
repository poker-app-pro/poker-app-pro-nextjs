output "vm_id" {
  value = module.ubuntu_vm.vm_id
}

output "vm_name" {
  value = module.ubuntu_vm.vm_name
}

output "snapshot_cron_installed" {
  value = module.nightly_snapshot_cron.installed
}
