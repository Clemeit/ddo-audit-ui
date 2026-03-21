# DDO Audit

A real-time player population tracking project and live LFM viewer for Dungeons and Dragons Online.

## ⚠️ Trouble Viewing the Website?

See [my Reddit post](https://www.reddit.com/r/ddo/comments/1m8k5a1/ddo_audit_64bit_alpha_release/) on how to clear the website's cache and service workers.

## 💬 Feedback, Suggestions and Bugs

You can submit feedback, suggestions, and bug reports on DDO Audit's [feedback page](https://www.ddoaudit.com/feedback), by messaging me [on Discord](https://discord.com/users/313127244362940416), or by [opening an issue](https://github.com/Clemeit/ddo-audit-ui/issues) here on GitHub. I'll usually open an issue here on GitHub for feedback submitted on the website or through Discord, so you can check there for open issues if you'd like.

## Tech Stack

- **React**: A JavaScript library for building user interfaces, used for the frontend of the application.

## Running Tests

This project uses [Jest](https://jestjs.io/) (via Create React App) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

Run the full test suite:

```bash
npx react-scripts test
```

This launches Jest in interactive watch mode by default. To run all tests once and exit (useful for CI):

```bash
npx react-scripts test --watchAll=false
```

Run tests matching a specific pattern:

```bash
npx react-scripts test --testPathPattern="utils/stringUtils"
```

Test files live in `__tests__` subdirectories alongside their source modules (e.g., `src/utils/__tests__/stringUtils.test.ts` tests `src/utils/stringUtils.ts`).

## Links:

- **Main website**: [https://www.ddoaudit.com](https://www.ddoaudit.com)
- **Backend repository**: [https://github.com/Clemeit/ddo-audit-service](https://github.com/Clemeit/ddo-audit-service)
