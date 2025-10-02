# Contributing to Task Manager

**Thank you for considering contributing!** 🎉

By [Digital Dream](https://www.digitaldream.work)

---

## 🎯 Ways to Contribute

### 1. Report Bugs
- Use GitHub Issues
- Include steps to reproduce
- Add screenshots if relevant
- Specify your environment (OS, browser, Node version)

### 2. Suggest Features
- Open a GitHub Discussion first
- Explain the use case
- Describe expected behavior
- Consider if it fits the project scope

### 3. Submit Pull Requests
- Fork the repository
- Create a feature branch (`git checkout -b feature/amazing-feature`)
- Make your changes
- Write/update tests if applicable
- Commit with clear messages
- Push to your fork
- Open a Pull Request

### 4. Improve Documentation
- Fix typos
- Add examples
- Clarify confusing sections
- Translate to other languages

### 5. Help Others
- Answer questions in Discussions
- Help troubleshoot issues
- Share your setup/config
- Write blog posts or tutorials

---

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ (LTS)
- npm or yarn
- Git

### Steps
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager

# Install dependencies
npm run setup

# Setup environment
cp server/.env.example server/.env
nano server/.env  # Edit as needed

# Run migrations
cd server
npx prisma generate
npx prisma migrate dev

# Start development
cd ..
npm run dev
```

---

## 📝 Code Style

### General
- Use **ES6+** syntax
- Use **async/await** over callbacks
- Add **JSDoc comments** for functions
- Keep functions **small and focused**
- Follow **existing patterns** in the codebase

### Frontend (React)
- Use **functional components** + hooks
- Use **shadcn/ui** components when possible
- Keep components **< 200 lines**
- Use **TailwindCSS** for styling
- Add **prop-types** or TypeScript types

### Backend (Node.js)
- Use **Express** best practices
- Validate input with **middleware**
- Use **Prisma** for database queries
- Add **error handling** (try/catch)
- Log errors with **context**

### Naming Conventions
- **Files**: camelCase.js or PascalCase.jsx
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Database**: snake_case

---

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Lint
npm run lint
```

### Writing Tests
- Add tests for **new features**
- Fix **failing tests** before merging
- Aim for **>80% coverage** (ideal, not required)

---

## 🚀 Pull Request Process

### Before Submitting
1. ✅ **Test locally** (ensure everything works)
2. ✅ **Run linter** (`npm run lint`)
3. ✅ **Update docs** if needed
4. ✅ **Rebase** on latest main
5. ✅ **Write clear commit messages**

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```
feat(tasks): add recurring tasks support

fix(auth): resolve login redirect issue

docs(readme): update installation steps
```

### PR Template
When opening a PR, include:
- **Description**: What does this PR do?
- **Related Issue**: Closes #123
- **Type**: Feature / Bug Fix / Documentation
- **Screenshots**: If UI change
- **Testing**: How did you test this?
- **Checklist**: 
  - [ ] Tests pass
  - [ ] Linter passes
  - [ ] Docs updated
  - [ ] No breaking changes (or documented)

---

## 🎁 Contributor Benefits

### Open Source Contributors
- **Recognition** in CONTRIBUTORS.md
- **Free Pro Cloud** account (while contributing)
- **Early access** to new features
- **Swag** (stickers, t-shirts) for significant contributions

### Top Contributors
- **Listed** on website
- **Free Enterprise** account
- **Co-author** on blog posts
- **Speaking opportunities** (meetups, conferences)

---

## 🤝 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior
- Be respectful and considerate
- Use welcoming and inclusive language
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Unacceptable Behavior
- Harassment, discrimination, or trolling
- Personal or political attacks
- Spamming or self-promotion
- Unwelcome sexual attention

### Enforcement
Violations will result in:
1. Warning
2. Temporary ban
3. Permanent ban (for severe/repeat violations)

Report issues to: conduct@digitaldream.work

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the **MIT License**.

---

## 🙏 Thank You!

Every contribution, no matter how small, makes a difference!

**Questions?** Open a Discussion or email: hello@digitaldream.work

---

**Made with ❤️ by [Digital Dream](https://www.digitaldream.work)**
