---
name: web-security-csp-xss
description: Best practices for client-side web security, XSS prevention, Content Security Policy, and safe DOM manipulation.
---

# Web Security & XSS Prevention Guidelines

Use this skill when handling user input injection, rendering dynamic HTML, parsing URL parameters, or configuring security headers.

## Guidelines
1. **Never Use `dangerouslySetInnerHTML`**: Avoid raw HTML rendering without sanitizing input via trusted libraries like DOMPurify.
2. **Safe URL Protocols**: Validate dynamic user links to allow only `http:`, `https:`, or `mailto:` protocols; reject `javascript:` URLs.
3. **Storage Security**: Never store secret keys, credentials, or sensitive auth tokens in plain LocalStorage.
4. **Rel Noopener**: Always add `rel="noopener noreferrer"` to external links opening in `target="_blank"`.
