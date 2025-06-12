# Security Notes

## Sensitive Files
- `service-account.json` and all `.env*` files are gitignored. Never commit secrets to version control.

## Security Headers
- The app sets strict security headers in `next.config.js` (CSP, HSTS, X-Frame-Options, etc).
- API routes include rate limiting headers and strict cache control.

## Dependency Management
- Run `npm audit` and `npm outdated` regularly.
- Use the provided `security-check` script before installing new dependencies.

## Additional Recommendations
- Validate all user input.
- Use parameterized queries for any database access.
- Implement CSRF protection for forms and API routes.
- Handle errors gracefully to avoid leaking sensitive information.
- Use secure password hashing if handling authentication.

## Reporting Vulnerabilities
- Add a `security.txt` file or contact info for responsible disclosure. 