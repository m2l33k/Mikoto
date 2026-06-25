# An NF may read its own certificate material from the PKI engine.
path "pki/issue/nf" {
  capabilities = ["create", "update"]
}
path "secret/data/nf-certs/{{identity.entity.name}}" {
  capabilities = ["read"]
}
