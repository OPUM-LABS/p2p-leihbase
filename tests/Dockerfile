FROM mcr.microsoft.com/playwright:v1.51.1-noble

WORKDIR /home/pwuser

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN corepack enable pnpm

RUN pnpm i

COPY playwright.config.ts ./

RUN npx playwright install chromium webkit --with-deps

CMD npx playwright test