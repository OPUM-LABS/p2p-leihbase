# 🌱 P2P Leihbase

**Open-source Peer-to-Peer (P2P) and Community Lending Platform** — Share, borrow, and lend everyday items in your neighborhood or community ("Library of Things" / *Leihen statt Kaufen*).

> [!NOTE]
> This project is a specialized fork of the original [leihbase/leihbase](https://github.com/leihbase/leihbase), extending it with direct Peer-to-Peer (P2P) neighbor lending, interactive timeslot coordination, 1-click action email tokens, and enhanced localization.

---

## 🌟 Overview

**P2P Leihbase** is a modern, lightweight web application designed to empower circular economy sharing within local communities, neighborhoods, and lending stores (*Leihladen*). 

Users can list their own items, browse borrowable tools, kitchen appliances, electronics, or outdoor gear, request loans, coordinate handover and return appointments interactively, and manage the entire lending lifecycle.

---

## ✨ Features

### 🤝 Peer-to-Peer & Community Lending
- **User Item Listings:** Community members can publish items with photos, descriptions, deposit amounts, borrow limits, and locations.
- **Lending Request Workflow:** Borrowers can submit booking requests with custom messages.
- **1-Click Email Actions:** Lenders can accept or decline requests directly from transactional emails via secure one-time action tokens.
- **Status Lifecycle:** Clear stages from `pending` ➔ `accepted` ➔ `handover` ➔ `started` ➔ `returned` / `ended`.

### 📅 Interactive Timeslot Coordination
- **Appointment Scheduling:** Both lenders and borrowers can propose multiple handover and return timeslots.
- **1-Click Slot Confirmation:** Confirm convenient meeting times with a single tap.
- **Calendar Integration:** Automated `.ics` calendar file attachments and direct **Google Calendar** / **Apple / Outlook** links sent in confirmation emails.

### 🌐 Multilingual (i18n)
- Seamless support for **German (`de`)** and **English (`en`)**.
- In-app language switcher in navbar and footer.
- User profile language preferences with automatic localization for transactional emails and notifications.

### 📧 Unified Transactional Email Engine
- Responsive, mobile-friendly HTML email layouts for:
  - Lending requests & confirmations
  - Handover and return timeslot proposals
  - Calendar appointment confirmations
  - Pickup & return reminder notifications
- Configurable SMTP settings (Microsoft 365, Google Workspace, Mailgun, SendGrid, etc.).

### 🔒 Privacy, Security & Administration
- **Authentication:** User signup, email verification, and password reset flows.
- **Bot Protection (Optional):** Integration with privacy-friendly [Cap](https://trycap.dev/) CAPTCHA for signup protection.
- **Privacy Analytics (Optional):** Cookie-free analytics via [Plausible](https://plausible.io/).
- **Admin Dashboard:** Built-in [PocketBase](https://pocketbase.io/) interface for managing users, categories, products, reservations, and global settings.

---

## 📦 Docker Images (GitHub Container Registry)

Pre-built Docker images are published automatically to **GitHub Container Registry (GHCR)**:

| Component | Image |
| :--- | :--- |
| **Nuxt Web Frontend** | `ghcr.io/opum-labs/p2p-leihbase-web:latest` |
| **PocketBase Backend** | `ghcr.io/opum-labs/p2p-leihbase-pb:latest` |

You can pull them directly via:
```bash
docker pull ghcr.io/opum-labs/p2p-leihbase-web:latest
docker pull ghcr.io/opum-labs/p2p-leihbase-pb:latest
```

---

## 🚀 Deployment & Quick Start

### Option A: Using Pre-Built Images from GHCR

Create a `docker-compose.yml` on your server and point to the pre-built GHCR images:

```yaml
services:
  web:
    image: ghcr.io/opum-labs/p2p-leihbase-web:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NUXT_PUBLIC_LOCALE: "${NUXT_PUBLIC_LOCALE:-de}"
      NUXT_PUBLIC_POCKETBASE_SERVER_BASE_URL: "${NUXT_PUBLIC_POCKETBASE_SERVER_BASE_URL:-http://pocketbase:8090}"
      NUXT_PUBLIC_POCKETBASE_CLIENT_BASE_URL: "${NUXT_PUBLIC_POCKETBASE_CLIENT_BASE_URL:-http://localhost:8090}"
    networks:
      - leihbar

  pocketbase:
    image: ghcr.io/opum-labs/p2p-leihbase-pb:latest
    restart: unless-stopped
    ports:
      - "8090:8090"
    environment:
      CONFIG_LOCALE: "${CONFIG_LOCALE:-de}"
      CONFIG_APP_NAME: "${CONFIG_APP_NAME:-Leihbase}"
      CONFIG_APP_URL: "${CONFIG_APP_URL:-http://localhost:3000}"
      CONFIG_SMTP_ENABLED: "${CONFIG_SMTP_ENABLED:-false}"
      CONFIG_SMTP_HOST: "${CONFIG_SMTP_HOST:-}"
      CONFIG_SMTP_PORT: "${CONFIG_SMTP_PORT:-587}"
      CONFIG_SMTP_USERNAME: "${CONFIG_SMTP_USERNAME:-}"
      CONFIG_SMTP_PASSWORD: "${CONFIG_SMTP_PASSWORD:-}"
      CONFIG_SMTP_SENDER_ADDRESS: "${CONFIG_SMTP_SENDER_ADDRESS:-}"
    volumes:
      - ./pb_data:/pb/pb_data
    networks:
      - leihbar

networks:
  leihbar:
```

### Option B: Building from Source (Local Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/OPUM-LABS/p2p-leihbase.git
   cd p2p-leihbase
   ```

2. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Build and run:
   ```bash
   docker compose up -d --build
   ```

### Accessing the Platform

- **Web Frontend:** [http://localhost:3000](http://localhost:3000)
- **PocketBase Admin UI:** [http://localhost:8090/_/](http://localhost:8090/_/)

---

## ⚙️ Configuration & Environment Variables

All settings are configured through the `.env` file (see [`.env.example`](./.env.example)):

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NUXT_PUBLIC_LOCALE` | Default frontend language (`de` or `en`) | `de` |
| `CONFIG_LOCALE` | Default backend email language (`de` or `en`) | `de` |
| `CONFIG_APP_NAME` | Platform brand name (e.g. `Leihbase`, `P2Prêt`) | `Leihbase` |
| `CONFIG_APP_URL` | Public base URL of your web application | `http://localhost:3000` |
| `CONFIG_SMTP_ENABLED` | Enable transactional emails | `false` |
| `CONFIG_SMTP_HOST` | SMTP server hostname | `smtp.example.com` |
| `CONFIG_SMTP_PORT` | SMTP port (e.g. `587` or `465`) | `587` |
| `CONFIG_SMTP_USERNAME` | SMTP authentication username / email | — |
| `CONFIG_SMTP_PASSWORD` | SMTP authentication password | — |
| `CONFIG_SMTP_SENDER_ADDRESS` | From-address for outgoing emails | `info@example.com` |
| `CONFIG_SMTP_SENDER_NAME` | Sender display name | `Leihbase` |
| `NUXT_PUBLIC_PLAUSIBLE_TRACKING_DOMAIN` | *(Optional)* Plausible Analytics domain | `""` |
| `CONFIG_CAP_INSTANCE_HOST` | *(Optional)* Cap CAPTCHA instance host | `""` |
| `CONFIG_CAP_SITE_KEY` | *(Optional)* Cap CAPTCHA site key | `""` |
| `CONFIG_CAP_SECRET_KEY` | *(Optional)* Cap CAPTCHA secret key | `""` |

---

## 💻 Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+) & [pnpm](https://pnpm.io/)
- [Mise](https://mise.jdx.dev) (optional, for toolchain management)

### Running Locally without Docker

```bash
# 1. Install dependencies
pnpm install

# 2. Run PocketBase backend (in /pocketbase)
./pocketbase/pocketbase serve --http=0.0.0.0:8090

# 3. Run Nuxt frontend (in /web)
cd web
pnpm dev
```

---

## 🧪 Testing

To run the end-to-end test suite:

```bash
# Run Playwright tests
pnpm --filter @leihbase/web test:e2e
```

---

## 🙏 Credits & Upstream

- **Upstream:** This project is a fork of [leihbase/leihbase](https://github.com/leihbase/leihbase), originally created for the [Leihbar in Cologne](https://leihbar-koeln.de/). We are deeply grateful to the original authors and contributors.
- **AI-Assisted Development:** The P2P extensions, appointment scheduling system, multilingual email engine, and related architectural enhancements were realized with the assistance of AI (Google Antigravity / Gemini).

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (GNU AGPLv3)** — see the [LICENSE](LICENSE) file for details.
