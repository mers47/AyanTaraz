# TODO — Deploy Script Enhancement

## Tasks
- [x] D1. Analyze current deploy.sh and .env.example to understand all required env vars
- [x] D2. Write new deploy.sh with automatic .env generation (passwords, JWT secret, etc.)
- [x] D3. User only needs to fill in API keys (SMS_API_URL, SMS_API_KEY, SMS_SENDER, SEED_SUPER_ADMIN_PHONES) at the end
- [x] D4. Add interactive prompt for super-admin phone number during deploy
- [x] D5. Add SSL/Certbot integration for domain mode
- [x] D6. Update .env.example to match new auto-generated format
- [x] D7. Test shell syntax (bash -n) of the new script
- [x] D8. Update README with deploy instructions
- [ ] D9. Commit, push, PR, merge to main
