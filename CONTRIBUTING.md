# Contributing to FitnesERI

## Git Workflow

1. Create a feature branch from `develop`
   \`\`\`bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   \`\`\`

2. Make your changes

3. Commit with meaningful messages
   \`\`\`bash
   git add .
   git commit -m "feat: add user authentication"
   \`\`\`

4. Push to GitHub
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`

5. Create Pull Request to `develop`

## Commit Message Format

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` code formatting
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

## Code Style

- Use ESLint and Prettier
- Follow existing code patterns
- Write meaningful variable names
- Add comments for complex logic

## Testing

- Write unit tests for new features
- Ensure all tests pass before PR
- Maintain >70% code coverage