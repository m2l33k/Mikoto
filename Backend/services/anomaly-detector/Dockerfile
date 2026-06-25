# syntax=docker/dockerfile:1
FROM golang:1.22-bookworm AS build
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download || true
COPY . .
# CGO is required by onnxruntime_go.
RUN CGO_ENABLED=1 go build -o /out/detector ./cmd/detector

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libgomp1 && rm -rf /var/lib/apt/lists/*
COPY --from=build /out/detector /detector
COPY models /models
EXPOSE 8091
ENTRYPOINT ["/detector"]
