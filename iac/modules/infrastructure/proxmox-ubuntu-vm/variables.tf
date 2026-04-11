variable "node_name" { type = string }
variable "vm_id" { type = number }
variable "vm_name" { type = string }
variable "template" { type = string }
variable "cpu_cores" { type = number }
variable "cpu_sockets" { type = number }
variable "memory_mb" { type = number }
variable "disk_gb" { type = number }
variable "storage_pool" { type = string }
variable "bridge" { type = string }
variable "ci_user" { type = string }
variable "ssh_public_key" { type = string }
variable "ipconfig0" { type = string }
variable "nameserver" { type = string, default = null }
variable "search_domain" { type = string, default = null }
variable "balloon_mb" { type = number, default = 0 }
variable "start_on_boot" { type = bool, default = true }
variable "agent_enabled" { type = bool, default = true }
