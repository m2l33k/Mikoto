# 04 — Environment Setup

Goal: a Linux environment where you can build Go services, load the `gtp5g` kernel
module, run MongoDB, and drive the core with a RAN/UE simulator.

You are on **Windows 11**. Pick **Option A (Ubuntu VM)** — it is the most reliable
because the UPF needs to load a kernel module.

---

## Option A — Ubuntu VM (recommended)

### A.1 Create the VM
- Install **VirtualBox**, **VMware Workstation Player**, or **Hyper-V**.
- Image: **Ubuntu Server/Desktop 22.04 LTS**.
- Resources: 4+ vCPU, 8+ GB RAM, 30 GB disk.
- Network: enable a bridged or NAT adapter with internet access.

### A.2 Base packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git make gcc cmake build-essential \
    libsctp-dev lksctp-tools iproute2 \
    wget curl net-tools tcpdump
```

### A.3 Install Go
```bash
wget https://go.dev/dl/go1.26.0.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.26.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin' >> ~/.bashrc
source ~/.bashrc
go version          # expect go1.26.x
```

### A.4 Install the gtp5g kernel module (for the UPF)
```bash
sudo apt install -y linux-headers-$(uname -r)
git clone https://github.com/free5gc/gtp5g.git
cd gtp5g
make
sudo make install
sudo modprobe gtp5g
lsmod | grep gtp5g     # should appear → data path is ready
```
> If `make` fails, your kernel headers don't match the running kernel. Reboot,
> re-check `uname -r`, reinstall matching headers.

### A.5 Install MongoDB
```bash
# Ubuntu 22.04 example
sudo apt install -y gnupg
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
mongosh --eval 'db.runCommand({ ping: 1 })'   # → ok: 1
```

### A.6 Install the RAN/UE simulator (UERANSIM)
```bash
sudo apt install -y make gcc g++ libsctp-dev lksctp-tools iproute2
sudo snap install cmake --classic    # or apt
git clone https://github.com/aligungr/UERANSIM
cd UERANSIM && make
ls build/    # nr-gnb, nr-ue, nr-cli
```

### A.7 Enable IP forwarding (so user data can reach the internet)
```bash
sudo sysctl -w net.ipv4.ip_forward=1
# NAT the UPF's N6 interface (adjust eth0 to your VM's uplink):
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
```

---

## Option B — Docker Compose for the control plane (faster inner loop)

You can run the *control-plane* NFs in containers while still needing a Linux
kernel for the UPF. Good for developing NRF/AMF/SMF/AUSF/UDM quickly.

```bash
# from your project root once you have Dockerfiles + compose (see doc 11)
docker compose up -d nrf udm ausf amf smf mongodb
docker compose logs -f amf
```
The UPF container still requires the host kernel to have `gtp5g` and to run with
`--cap-add=NET_ADMIN --network host` (or equivalent). On Windows Docker Desktop
this is unreliable — keep the UPF in the Ubuntu VM.

---

## Verifying the environment

Run this checklist before writing NF code:

```bash
go version                 # Go toolchain OK
lsmod | grep gtp5g         # data path module loaded
mongosh --eval 'db.runCommand({ping:1})'   # database up
ls UERANSIM/build/nr-gnb   # simulator built
docker --version           # containers available
sysctl net.ipv4.ip_forward # = 1
```

All green → proceed to development.

---

## Project bootstrap

```bash
mkdir my5gc && cd my5gc
git init
go work init                       # Go workspace for multi-module repo
for nf in nrf amf smf upf ausf udm common; do
  mkdir -p $nf && (cd $nf && go mod init github.com/<you>/my5gc/$nf)
  go work use ./$nf
done
mkdir -p docs deploy config scripts
```

Copy this `docs/` folder into `my5gc/docs/`.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `gtp5g` make fails | Header/kernel mismatch | Reinstall `linux-headers-$(uname -r)`, reboot |
| AMF can't bind SCTP | `libsctp` missing | `apt install libsctp-dev lksctp-tools` |
| UE registers but no internet | NAT/forwarding off | `ip_forward=1` + MASQUERADE rule |
| NFs can't find each other | Wrong `nrfUri` | Check config; resolve via NRF only |
| Mongo refused | Service not running | `sudo systemctl status mongod` |

## Next

→ [05 — Development Roadmap](05-roadmap.md)
