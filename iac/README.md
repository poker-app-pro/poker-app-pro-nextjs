# Proxmox IaC Stack (Ubuntu VM + Nightly Snapshots)

This folder contains a complete Terraform/OpenTofu Infrastructure-as-Code stack for:

- Managing a Proxmox VE node.
- Provisioning one Ubuntu VM from a cloud image template.
- Enforcing a nightly snapshot policy on that VM.

The codebase is structured with an onion-architecture-inspired layering model:

- **Domain layer**: pure configuration contract + validation.
- **Application layer**: orchestration and use-case composition.
- **Infrastructure layer**: provider-specific Proxmox and host automation resources.

## Architecture

```text
iac/
├── main.tf                          # composition root
├── providers.tf                     # providers + auth wiring
├── variables.tf                     # root input contract
├── outputs.tf                       # root outputs
├── versions.tf                      # Terraform & provider versions
├── terraform.tfvars.example         # starter variables
└── modules
    ├── domain-vm-contract           # domain layer
    ├── application/proxmox-node-stack
    └── infrastructure
        ├── proxmox-ubuntu-vm
        └── nightly-snapshot-cron
```

## Prerequisites

1. Proxmox VE node reachable from the machine running Terraform.
2. API token created in Proxmox (`Datastore.AllocateSpace`, `VM.Allocate`, `VM.Config.*`, `VM.Snapshot`).
3. Ubuntu cloud image template already available in Proxmox.
4. SSH access from Terraform runner to Proxmox host (for cron-based nightly snapshots).

## Quick start

```bash
cd iac
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars with your node/template/network details
terraform init
terraform plan
terraform apply
```

## Nightly snapshots design

The stack writes a cron entry on the Proxmox node that executes:

```bash
qm snapshot <vmid> nightly-YYYYMMDD-HHMM --description "nightly snapshot via terraform"
```

at the configured UTC time.

Retention is enforced in the same cron line by pruning older `nightly-*` snapshots, keeping `snapshot_retention` most recent entries.

## Notes

- Snapshot schedule runs on **UTC** by default for predictability.
- If you prefer Proxmox backup jobs instead of snapshots, add a dedicated backup module and disable the cron module.
- Use a dedicated automation account on the Proxmox host for SSH provisioning.
