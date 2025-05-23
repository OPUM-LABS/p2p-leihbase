FROM mcr.microsoft.com/playwright:v1.51.1-noble

WORKDIR /home/pwuser

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN corepack enable pnpm

RUN pnpm i

RUN npx playwright install chromium webkit --with-deps

COPY playwright.config.ts ./

CMD npx playwright test