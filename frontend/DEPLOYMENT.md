# 🚀 Frontend Deployment Guide

Panduan deployment untuk STTPU Inventory Frontend dengan berbagai metode.

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm atau yarn
- Backend API sudah running (untuk testing)

## 🏗️ Build Process

### 1. Development Build
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Production Build
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build (optional)
npm run preview
```

Build output akan tersedia di folder `dist/`.

## 🌐 Deployment Methods

### 1. Static File Server

#### Nginx
```bash
# Copy build files to nginx directory
sudo cp -r dist/* /var/www/html/

# Use nginx.conf.example as reference
sudo cp nginx.conf.example /etc/nginx/sites-available/inventory-frontend
sudo ln -s /etc/nginx/sites-available/inventory-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Apache
```bash
# Copy build files
sudo cp -r dist/* /var/www/html/

# Create .htaccess for SPA routing
echo "RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]" | sudo tee /var/www/html/.htaccess
```

### 2. Docker Deployment

**Dockerfile:**
```dockerfile
FROM nginx:alpine

# Copy build files
COPY dist/ /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf.example /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
# Build Docker image
docker build -t inventory-frontend .

# Run container
docker run -p 3000:80 inventory-frontend
```

### 3. Node.js Server

```bash
# Install serve globally
npm install -g serve

# Serve build files
serve -s dist -p 3000
```

### 4. CDN Deployment

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

## ⚙️ Environment Configuration

### Production Environment Variables

Create `.env.production`:
```env
VITE_API_BASE_URL=https://your-backend-api.com
VITE_APP_ENV=production
VITE_ENABLE_DEBUG=false
```

### Build with specific environment
```bash
# Load production env
cp .env.production .env
npm run build
```

## 🔧 Web Server Configuration

### Nginx (Recommended)

**Key configurations:**
- SPA routing support
- Static file caching
- Gzip compression
- Security headers
- API proxying (optional)

**Example config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Apache

**Key configurations:**
- Enable mod_rewrite
- SPA routing with .htaccess
- Static file caching

**Example .htaccess:**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static files
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

## 🚀 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to server
      run: |
        rsync -avz dist/ user@server:/var/www/html/
```

## 🔍 Health Check

Setelah deployment, verify:

1. **Frontend accessible**: `http://your-domain.com`
2. **SPA routing works**: Navigate to `/assets` directly
3. **API connection**: Check browser network tab
4. **Static files cached**: Check response headers
5. **No console errors**: Open browser dev tools

## 🐛 Troubleshooting

### Common Issues

**1. White screen after deployment**
- Check browser console for errors
- Verify build files copied correctly
- Check web server configuration

**2. 404 on page refresh**
- Configure SPA routing (try_files in nginx)
- Add .htaccess for Apache

**3. API connection failed**
- Check VITE_API_BASE_URL in .env
- Verify CORS settings on backend
- Check network connectivity

**4. Assets not loading**
- Check file paths in build
- Verify static file serving
- Check permissions on files

### Debug Commands

```bash
# Check build output
ls -la dist/

# Test local serve
npx serve -s dist

# Check nginx config
nginx -t

# View nginx logs
tail -f /var/log/nginx/error.log
```

## 📊 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx vite-bundle-analyzer dist

# Build with source maps (for debugging)
GENERATE_SOURCEMAP=true npm run build
```

### Web Server Optimization
- Enable gzip compression
- Set proper cache headers
- Use CDN for static assets
- Enable HTTP/2

## 🔐 Security Considerations

1. **Environment Variables**: Never commit .env files
2. **API Keys**: Use backend proxy for sensitive APIs
3. **HTTPS**: Always use HTTPS in production
4. **Security Headers**: Configure CSP, XSS protection
5. **File Permissions**: Restrict file access appropriately

## 📈 Monitoring

### Metrics to monitor:
- Page load time
- Bundle size
- Error rates
- API response times
- User engagement

### Tools:
- Google Analytics
- Sentry for error tracking
- Lighthouse for performance
- Web Vitals
