variable "node_name" {
  type = string
}

variable "vm" {
  type = object({
    id               = number
    name             = string
    template         = string
    cpu_cores        = number
    cpu_sockets      = number
    memory_mb        = number
    disk_gb          = number
    storage_pool     = string
    bridge           = string
    ip_cidr          = string
    gateway          = string
    ci_user          = string
    ssh_public_key   = string
    search_domain    = optional(string)
    nameserver       = optional(string)
    balloon_mb       = optional(number)
    start_on_boot    = optional(bool)
    agent_enabled    = optional(bool)
  })

  validation {
    condition     = var.vm.id > 99 && var.vm.id < 1000000000
    error_message = "vm.id must be a positive non-reserved VMID."
  }

  validation {
    condition     = var.vm.cpu_cores >= 1 && var.vm.cpu_sockets >= 1
    error_message = "cpu_cores and cpu_sockets must both be >= 1."
  }

  validation {
    condition     = var.vm.memory_mb >= 512
    error_message = "memory_mb must be at least 512 MB."
  }

  validation {
    condition     = var.vm.disk_gb >= 8
    error_message = "disk_gb must be at least 8 GB."
  }

  validation {
    condition     = can(regex("^[^\\s]+/[0-9]{1,2}$", var.vm.ip_cidr))
    error_message = "ip_cidr must be in CIDR format, e.g. 192.168.1.10/24."
  }
}

variable "snapshot_schedule" {
  type = object({
    enabled           = bool
    minute            = number
    hour              = number
    retention         = number
    ssh_host          = string
    ssh_port          = optional(number)
    ssh_user          = string
    ssh_private_key   = string
    cron_identifier   = optional(string)
    snapshot_prefix   = optional(string)
    snapshot_comment  = optional(string)
  })

  validation {
    condition     = var.snapshot_schedule.minute >= 0 && var.snapshot_schedule.minute <= 59
    error_message = "snapshot_schedule.minute must be between 0 and 59."
  }

  validation {
    condition     = var.snapshot_schedule.hour >= 0 && var.snapshot_schedule.hour <= 23
    error_message = "snapshot_schedule.hour must be between 0 and 23."
  }

  validation {
    condition     = var.snapshot_schedule.retention >= 1
    error_message = "snapshot_schedule.retention must be at least 1."
  }
}
