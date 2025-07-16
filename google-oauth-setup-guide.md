# Google OAuth Setup Guide - Fix Transform URL Issue

## Current Issue
Google Sign-In gets stuck on `https://accounts.google.com/gsi/transform`

## Solution Steps

### 1. Add ALL Possible Origins to Google Cloud Console

Go to: https://console.cloud.google.com/
Navigate to: APIs & Services → Credentials
Click on your OAuth 2.0 Client ID

**In "Authorized JavaScript origins", add these URLs:**
- `http://localhost`
- `http://localhost:3000`
- `http://localhost:8080`
- `http://127.0.0.1`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:8080`
- `http://localhost:3000/`
- `http://127.0.0.1:3000/`

**In "Authorized redirect URIs", add these URLs:**
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:3000/`
- `http://127.0.0.1:3000/`

### 2. Clear Browser Data Completely

1. Open Chrome Settings
2. Go to Privacy and Security → Clear browsing data
3. Select "All time" for time range
4. Check ALL boxes (cookies, cache, etc.)
5. Click "Clear data"
6. Restart Chrome

### 3. Try Different Browser

Test in Edge, Firefox, or Safari to see if it's browser-specific.

### 4. Check for Browser Extensions

Disable all browser extensions temporarily and test.

### 5. Alternative: Use Different Port

Try running the server on port 8080 instead of 3000.

## Expected Result
After adding all origins and clearing cache, Google Sign-In should work without getting stuck on the transform URL. 