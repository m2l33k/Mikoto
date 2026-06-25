# syntax=docker/dockerfile:1
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download || true
COPY . .
RUN CGO_ENABLED=0 go build -o /out/runner ./cmd/runner \
 && CGO_ENABLED=0 go build -o /out/runner-cli ./cmd/cli

# tcpdump is needed for per-test pcap capture.
FROM alpine:3.20
RUN apk add --no-cache tcpdump ca-certificates
COPY --from=build /out/runner /usr/local/bin/runner
COPY --from=build /out/runner-cli /usr/local/bin/runner-cli
EXPOSE 8092
ENTRYPOINT ["/usr/local/bin/runner"]
