# An NF may read its own MongoDB credentials.
path "secret/data/db/{{identity.entity.name}}" {
  capabilities = ["read"]
}
