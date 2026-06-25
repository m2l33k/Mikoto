# CFSSL image that generates the CA + per-NF certs on first run.
FROM cfssl/cfssl:latest
WORKDIR /work
COPY . /work
ENTRYPOINT ["./init.sh"]
