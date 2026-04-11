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
}


variable "ubuntu_template" {
  type = object({
    enabled          = bool
    vmid             = number
    name             = string
    storage_pool     = string
    snippets_storage = optional(string)
    cloud_image_url  = string
    ci_user          = string
    ssh_public_key   = string
    memory_mb        = optional(number)
    cpu_cores        = optional(number)
    cpu_sockets      = optional(number)
    ssh_host         = string
    ssh_port         = optional(number)
    ssh_user         = string
    ssh_private_key  = string
  })
}
