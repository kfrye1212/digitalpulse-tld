# Contributing to Digital Pulse TLD

Thank you for your interest in contributing to Digital Pulse TLD! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions with the community.

## How to Contribute

### Reporting Bugs

- Use the bug report template when creating an issue
- Search existing issues to avoid duplicates
- Include as much detail as possible
- Add screenshots or recordings if applicable

### Suggesting Features

- Use the feature request template
- Clearly describe the problem and proposed solution
- Explain why this feature would be useful
- Consider implementation complexity

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request** using the PR template

## Development Setup

This is a static web application that requires:

- Modern web browser
- Text editor or IDE
- Solana wallet extension (Phantom, Solflare, etc.)

### Local Development

1. Clone the repository
2. Open `index.html` in your browser
3. Or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```

## Coding Standards

### JavaScript

- Use modern ES6+ syntax
- Follow consistent naming conventions:
  - camelCase for variables and functions
  - PascalCase for classes
  - UPPER_CASE for constants
- Add comments for complex logic
- Keep functions focused and small

### HTML/CSS

- Use semantic HTML elements
- Follow BEM or similar CSS methodology
- Ensure responsive design
- Test across different browsers

### Security

- Sanitize user input
- Never store sensitive data
- Follow Web3 security best practices
- Validate all blockchain interactions

## Commit Messages

Write clear, concise commit messages:

```
Short summary (50 chars or less)

More detailed explanation if needed. Wrap at 72 characters.
Explain what and why, not how.

- Bullet points are acceptable
- Use present tense: "Add feature" not "Added feature"
```

## Testing

- Test all changes in multiple browsers
- Test wallet connections with different providers
- Verify no console errors
- Check mobile responsiveness

## Pull Request Process

1. Update documentation for any new features
2. Ensure all tests pass
3. Request review from maintainers
4. Address review feedback promptly
5. Maintain a clean commit history

## Review Criteria

Pull requests are reviewed for:

- Code quality and standards compliance
- Security considerations
- Performance impact
- Documentation completeness
- Test coverage
- Breaking changes

## Getting Help

- Open an issue for questions
- Tag issues appropriately
- Be patient and respectful

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to Digital Pulse TLD!
