# CommuniTree

CommuniTree is a full-stack web application designed to facilitate community engagement and resource sharing within municipalities. Built with modern web technologies, it enables intergenerational collaboration and sustainable resource management.

Read more on the purpose of CommuniTree in /docs/purpose-statement.md

## Tech Stack

- **Frontend**: SvelteKit with TypeScript
- **Backend**: Node.js (SvelteKit adapter-node)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Lucia
- **Styling**: TailwindCSS with typography, forms, and container-queries plugins
- **Internationalization**: Paraglide (supporting English and Swedish)
- **Content**: MDsvex for Markdown processing
- **Testing**: Vitest and Playwright
- **Code Quality**: ESLint and Prettier
- **Database Management**: Docker Compose for local development

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (if not using Docker)
- npm (comes with Node.js)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/BjornKennethHolmstrom/communitree.git
cd communitree
```

2. Install dependencies:
```bash
npm install
```

3. Start the database (using Docker):
```bash
npm run db:start
```

4. Push the database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/communitree
```

For production, you'll need to set appropriate values for:
- `DATABASE_URL` - Your production database URL

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run Vitest unit tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:start` - Start PostgreSQL in Docker
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

## Project Structure

```
communitree/
├── src/
│   ├── lib/
│   │   ├── components/    # Shared Svelte components
│   │   ├── db/           # Database schema and utilities
│   │   ├── server/       # Server-side code
│   │   └── utils/        # Shared utilities
│   ├── messages/         # Translation messages
│   │   ├── en.json      # English translations
│   │   └── sv.json      # Swedish translations
│   └── routes/          # SvelteKit routes
├── static/              # Static assets
├── tests/              # Test files
├── drizzle/            # Database migrations
└── docker-compose.yml  # Docker configuration
```

## Adding New Features

1. **Database Changes**
   - Add new schema in `src/lib/db/schema.ts`
   - Run `npm run db:push` to update the database

2. **New Routes**
   - Add new routes in `src/routes`
   - Update navigation if needed

3. **Translations**
   - Add new strings to `src/messages/en.json` and `src/messages/sv.json`
   - Use translation keys in components

## Testing

- Unit tests go in `src/**/*.test.ts`
- E2E tests go in `tests/`
- Run all tests before committing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For questions and support, please [create an issue](https://github.com/BjornKennethHolmstrom/communitree/issues) on the repository.
