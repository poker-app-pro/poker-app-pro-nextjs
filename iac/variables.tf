variable "proxmox_api_url" {
  description = "Proxmox API URL, e.g. https://pve.example.com:8006/api2/json"
  type        = string
}

variable "proxmox_api_token_id" {
  description = "Proxmox API token id in the format user@realm!token"
  type        = string
  sensitive   = true
}

variable "proxmox_api_token_secret" {
  description = "Proxmox API token secret"
  type        = string
  sensitive   = true
}

variable "proxmox_tls_insecure" {
  description = "Disable TLS verification for Proxmox API"
  type        = bool
  default     = false
}

variable "node_name" {
  description = "Target Proxmox node"
  type        = string
}

variable "vm" {
  description = "Ubuntu VM desired state"
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
  description = "Nightly snapshot schedule configuration (UTC)"
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
