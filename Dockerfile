# syntax = docker/dockerfile:1
FROM golang:1.22.3-alpine AS builder

RUN apk add --no-cache git ca-certificates build-base su-exec olm-dev

WORKDIR /build
COPY go.mod .
# COPY go.sum .
RUN go mod download

COPY proxy.go .
COPY siwn.html .
RUN go build -o neynar-proxy proxy.go
RUN mv ./neynar-proxy /usr/bin/neynar-proxy

FROM alpine
WORKDIR /app

ENV UID=1337 \
    GID=1337

RUN apk add --no-cache ffmpeg su-exec ca-certificates olm bash jq yq curl

COPY --from=builder /usr/bin/neynar-proxy /usr/bin/neynar-proxy

CMD ["/usr/bin/neynar-proxy"]
