FROM php:8.3-cli-alpine

RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS curl-dev \
    && docker-php-ext-install curl \
    && apk add --no-cache libcurl \
    && apk del .build-deps

WORKDIR /app

COPY backend/api/assistant.php ./backend/api/assistant.php

ENV PORT=10000

EXPOSE 10000

CMD ["sh", "-c", "exec php -S 0.0.0.0:${PORT:-10000} -t /app"]
