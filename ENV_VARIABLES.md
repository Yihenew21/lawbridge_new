# Environment Variables - Complete Reference

## Required Variables

### Database
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### JWT Authentication
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
```

### Application URL
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production: https://lawbridge.et
```

---

## Cloud Storage (Required for Production)

Choose ONE of the following providers:

### Option 1: Cloudflare R2 (Recommended)
```env
S3_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET_NAME=lawbridge-uploads
S3_ACCESS_KEY_ID=your_r2_access_key_id
S3_SECRET_ACCESS_KEY=your_r2_secret_access_key
S3_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### Option 2: AWS S3
```env
S3_ENDPOINT=https://s3.amazonaws.com
S3_REGION=us-east-1
S3_BUCKET_NAME=lawbridge-uploads
S3_ACCESS_KEY_ID=your_aws_access_key_id
S3_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_PUBLIC_URL=https://lawbridge-uploads.s3.amazonaws.com
```

### Option 3: DigitalOcean Spaces
```env
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_REGION=nyc3
S3_BUCKET_NAME=lawbridge-uploads
S3_ACCESS_KEY_ID=your_do_access_key_id
S3_SECRET_ACCESS_KEY=your_do_secret_access_key
S3_PUBLIC_URL=https://lawbridge-uploads.nyc3.cdn.digitaloceanspaces.com
```

---

## Email Service (Optional but Recommended)

### Resend (Recommended)
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=LawBridge Ethiopia <noreply@lawbridge.et>
```

### Alternative: SendGrid
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@lawbridge.et
```

---

## Complete .env.local Example

```env
# Database (Required)
DATABASE_URL=postgresql://user:password@host:5432/lawbridge

# JWT Secret (Required)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Application URL (Required)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloud Storage - Cloudflare R2 (Required for Production)
S3_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET_NAME=lawbridge-uploads
S3_ACCESS_KEY_ID=your_r2_access_key_id
S3_SECRET_ACCESS_KEY=your_r2_secret_access_key
S3_PUBLIC_URL=https://pub-xxxxx.r2.dev

# Email Service - Resend (Optional)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=LawBridge Ethiopia <noreply@lawbridge.et>
```

---

## Development vs Production

### Development (.env.local)
- Use `http://localhost:3000` for NEXT_PUBLIC_APP_URL
- Email service optional (falls back to console logging)
- Cloud storage optional (but recommended for testing)

### Production (.env.production)
- Use your actual domain for NEXT_PUBLIC_APP_URL
- Cloud storage REQUIRED
- Email service REQUIRED
- Use strong JWT_SECRET (generate with: `openssl rand -base64 32`)

---

## Security Notes

1. **Never commit .env files to git**
   - Already in .gitignore
   - Use environment variables in hosting platform

2. **Rotate secrets regularly**
   - Change JWT_SECRET every 6 months
   - Rotate API keys annually

3. **Use different credentials per environment**
   - Separate buckets for dev/staging/production
   - Different API keys for each environment

---

## Verifying Setup

Run this to check all required variables:

```bash
# Check if variables are set
node -e "
const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'S3_ENDPOINT',
  'S3_BUCKET_NAME',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_PUBLIC_URL'
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required variables:', missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ All required variables are set');
}
"
```

---

## Getting Help

- Cloud Storage Setup: See `CLOUD_STORAGE_SETUP.md`
- Email Service Setup: See `lib/email.ts` comments
- Database Setup: See migration scripts in `scripts/`
