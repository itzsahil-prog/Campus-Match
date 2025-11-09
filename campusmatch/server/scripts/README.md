# Admin Setup Scripts

## Create Admin User

To create the default admin user, run:

```bash
cd server
npm run create-admin
```

This will create an admin account with the following credentials:

- **Email**: `itzsahil@admin.campusmatch.com`
- **Password**: `radhekrishna`
- **Role**: `admin`

### Admin Capabilities

The admin user has access to:
- User management (view, ban, delete users)
- Content moderation (review reports, remove content)
- Platform statistics and analytics
- All admin dashboard features

### Important Notes

1. Make sure MongoDB is running and the `MONGODB_URI` is set in your `.env` file
2. The admin email domain `admin.campusmatch.com` should be added to `ALLOWED_EMAIL_DOMAINS` in `.env`
3. The script will skip creation if the admin user already exists
4. Change the admin password after first login in production

### Login

After creating the admin, you can login at:
- **Endpoint**: `POST /api/auth/login`
- **Body**: 
  ```json
  {
    "email": "itzsahil@admin.campusmatch.com",
    "password": "radhekrishna"
  }
  ```

The response will include a JWT token with admin privileges.
