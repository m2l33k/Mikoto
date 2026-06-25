# syntax=docker/dockerfile:1
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download || true
COPY . .
RUN CGO_ENABLED=0 go build -o /out/dashboard-api ./cmd/api

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/dashboard-api /dashboard-api
EXPOSE 8093
USER nonroot:nonroot
ENTRYPOINT ["/dashboard-api"]
