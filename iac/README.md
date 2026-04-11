# Proxmox IaC Stack (Ubuntu Template + VM + Nightly Snapshots)

This folder contains a complete Terraform/OpenTofu Infrastructure-as-Code stack for:

- Managing a Proxmox VE node.
- Creating/updating an Ubuntu cloud image template in Proxmox.
- Provisioning one Ubuntu VM cloned from that template.
- Enforcing a nightly snapshot policy on that VM.

The codebase is structured with an onion-architecture-inspired layering model:

- **Domain layer**: pure configuration contracts + validation.
- **Application layer**: orchestration and use-case composition.
- **Infrastructure layer**: provider-specific Proxmox and node automation resources.

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
        ├── ubuntu-cloud-template
        ├── proxmox-ubuntu-vm
        └── nightly-snapshot-cron
```

## Prerequisites

1. Proxmox VE node reachable from the machine running Terraform.
2. API token created in Proxmox (`Datastore.AllocateSpace`, `VM.Allocate`, `VM.Config.*`, `VM.Snapshot`).
3. SSH access from Terraform runner to Proxmox host (for template prep and cron-based nightly snapshots).

## Quick start

```bash
cd iac
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars with your node/template/network details
terraform init
terraform plan
terraform apply
```

## Ubuntu template management

When `ubuntu_template.enabled = true`, the stack will:

1. Download/update the Ubuntu cloud image on the Proxmox host.
2. Create template VM (if missing) with cloud-init settings.
3. Convert that VM to a Proxmox template.
4. Clone the workload VM from that template.

When `ubuntu_template.enabled = false`, VM cloning uses `vm.template` as provided.

## Nightly snapshots design

The stack writes a cron entry on the Proxmox node that executes `qm snapshot` nightly and prunes old snapshots based on retention.

## Notes

- Snapshot schedule runs on **UTC** by default for predictability.
- Use dedicated automation SSH credentials for template bootstrap and snapshot cron management.
