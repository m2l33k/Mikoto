# syntax=docker/dockerfile:1
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download || true
COPY . .
RUN CGO_ENABLED=0 go build -o /out/nrf-oauth2 ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/nrf-oauth2 /nrf-oauth2
EXPOSE 8090
USER nonroot:nonroot
ENTRYPOINT ["/nrf-oauth2"]
