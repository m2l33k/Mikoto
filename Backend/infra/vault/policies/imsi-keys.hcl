# Only the UDM may read IMSI encryption keys.
path "secret/data/imsi-keys/*" {
  capabilities = ["read"]
}
