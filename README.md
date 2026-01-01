# Guide My AI

Guide My AI is a centralized hub designed to manage your AI configuration assets. It allows you to create, store, and organize AI Profiles, Rules, and Model Context Protocol (MCP) server configurations, making it easy to standardise your AI interactions across different projects and environments.

## ✨ Key Features

- **🤖 AI Profiles**: Create and manage distinct personas or configurations for your AI assistants.
- **📏 Rules Management**: Define and store reusable rules and instructions to guide AI behavior.
- **🔌 MCP Server Configs**: Manage configurations for Model Context Protocol servers to easily connect your AI to external tools and data.
- **🔗 Shareable URLs**: Each profile has a unique, URL-safe slug (e.g., `username/react-profile`) for easy sharing and bookmarking.

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Backend Framework**: Native Bun HTTP with `@remix-run/fetch-router`
- **Frontend**: React (Server-side rendering approach)
- **Styling**: Tailwind CSS
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: [Better Auth](https://www.better-auth.com)

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0.0 or later)
- A GitHub OAuth App (see [Authentication Setup](#authentication-setup))

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd guide-my-ai
    ```

2.  **Install dependencies**

    ```bash
    bun install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory. You can use the following template:

    ```env
    APP_URL=http://localhost:3000
    AUTH_SECRET=your-secure-random-secret
    GITHUB_CLIENT_ID=your-github-client-id
    GITHUB_CLIENT_SECRET=your-github-client-secret
    ```

    > **Note**: For detailed instructions on getting GitHub credentials, please refer to [GITHUB_OAUTH_SETUP.md](./GITHUB_OAUTH_SETUP.md).

4.  **Database Setup**
    Initialize the SQLite database and run migrations:

    ```bash
    bun run db:generate
    bun run db:migrate
    ```

5.  **Build Assets**
    Compile the Tailwind CSS styles:

    ```bash
    bun run build:assets
    ```

### Running the Application

Start the development server:

```bash
bun run dev
```

The server will start at `http://localhost:3000`.

To watch for CSS changes concurrently during development:

```bash
bun run build:assets:watch
```

## 📜 Scripts

- `bun run dev`: Start the dev server in watch mode.
- `bun start`: Start the production server.
- `bun run build:assets`: Build Tailwind CSS output.
- `bun run build:assets:watch`: Build Tailwind CSS output in watch mode.
- `bun run db:generate`: Generate Drizzle migrations.
- `bun run db:migrate`: Apply Drizzle migrations.
- `bun test`: Run tests.

## 📂 Project Structure

- `src/server.ts`: Main entry point and server configuration.
- `src/routes.ts`: Route definitions.
- `src/auth/`: Authentication logic and handlers.
- `src/profiles/`: Profile management logic.
- `src/rules/`: Rule management logic.
- `src/mcps/`: MCP server management logic.
- `src/db/`: Database schema and connection.
- `src/layouts/`: UI layout components.
