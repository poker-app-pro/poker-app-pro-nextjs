locals {
  cron_line = "${var.minute} ${var.hour} * * * root /usr/sbin/qm snapshot ${var.vm_id} ${var.snapshot_prefix}-$(date +\\%Y\\%m\\%d-\\%H\\%M) --description '${var.snapshot_comment}' >/dev/null 2>&1; /usr/sbin/qm listsnapshot ${var.vm_id} | awk 'NR>1 {print $1}' | grep '^${var.snapshot_prefix}-' | sort -r | tail -n +$(( ${var.retention} + 1 )) | while read -r snap; do /usr/sbin/qm delsnapshot ${var.vm_id} "$snap" >/dev/null 2>&1; done"
}

resource "null_resource" "nightly_snapshot_cron" {
  count = var.enabled ? 1 : 0

  triggers = {
    cron_identifier  = var.cron_identifier
    vm_id            = tostring(var.vm_id)
    minute           = tostring(var.minute)
    hour             = tostring(var.hour)
    retention        = tostring(var.retention)
    snapshot_prefix  = var.snapshot_prefix
    snapshot_comment = var.snapshot_comment
  }

  connection {
    type        = "ssh"
    host        = var.ssh_host
    port        = var.ssh_port
    user        = var.ssh_user
    private_key = var.ssh_private_key
  }

  provisioner "remote-exec" {
    inline = [
      "set -euo pipefail",
      "CRON_FILE=/etc/cron.d/${var.cron_identifier}",
      "sudo install -m 0644 /dev/null \"$CRON_FILE\"",
      "echo '${local.cron_line}' | sudo tee \"$CRON_FILE\" >/dev/null",
      "sudo chmod 0644 \"$CRON_FILE\""
    ]
  }
}
