FROM alpine:latest AS base

ARG PB_VERSION=0.23.12

RUN apk add --no-cache \
    unzip \
    ca-certificates

# download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

FROM base AS prod
ARG PORT="8080"
ENV PORT=${PORT}
# copy migrations
COPY ./pb_migrations /pb/pb_migrations
# copy hooks
COPY ./pb_hooks /pb/pb_hooks
# start pocketbase
CMD /pb/pocketbase serve --http=0.0.0.0:${PORT}

FROM base AS dev
ARG PORT="8080"
ENV PORT=${PORT}
# start pocketbase
CMD /pb/pocketbase serve --http=0.0.0.0:${PORT}

FROM base AS test
ARG PORT="8080"
ENV PORT=${PORT}
# start pocketbase
CMD /pb/pocketbase migrate up; \
    /pb/pocketbase admin create test@example.com 1234567890; \
    /pb/pocketbase serve --http=0.0.0.0:${PORT}

