# 📊 GA4 Setup Guide

## Service Account Email
```
portfolio-analytics@formal-wonder-311107.iam.gserviceaccount.com
```

## Step-by-Step Instructions

### 1️⃣ Enable Google Analytics Data API

1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Google Analytics Data API"
3. Click on it
4. Click **"Enable"**
5. Wait for it to activate (~30 seconds)

### 2️⃣ Add Service Account to GA4

1. Go to: https://analytics.google.com/
2. Click **Admin** (⚙️ icon, bottom left)
3. Under **Property** column → Click **Property Access Management**
4. Click **"+"** (top right) → **Add users**
5. Enter email: `portfolio-analytics@formal-wonder-311107.iam.gserviceaccount.com`
6. Role: Select **"Viewer"**
7. Uncheck "Notify new users by email"
8. Click **"Add"**

### 3️⃣ Verify Property ID

Your current Property ID: **490943775**

To verify it's correct:
1. In GA4 → Click **Admin** → **Property Settings**
2. Check the **Property ID** number
3. If different, update `/opt/portfolio/.env`:
   ```
   GA4_PROPERTY_ID=YOUR_CORRECT_ID
   ```

### 4️⃣ Test the Setup

After completing steps 1-2, wait 5 minutes, then:

```bash
cd /opt/portfolio
docker-compose restart portfolio

# Wait 10 seconds
sleep 10

# Test API
curl http://localhost:3000/api/active-users | jq '.'
```

**Success looks like:**
```json
{
  "activeUsers": 3,
  "source": "ga4"
}
```

**Still fallback?** Check:
- Service account has "Viewer" role
- Correct Property ID
- API is enabled
- Wait 5-10 minutes for permissions to propagate

## 🔍 Troubleshooting

**Error: "Permission denied"**
→ Service account not added to GA4 property

**Error: "API not enabled"**
→ Go back to step 1

**Still using fallback after 10 minutes?**
→ Check docker logs: `docker logs portfolio 2>&1 | grep -i ga4`
