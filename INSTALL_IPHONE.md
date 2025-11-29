# 📱 Installing NelsyFit on iPhone

## Quick Installation Guide

Your app is already configured as a PWA (Progressive Web App) and can be installed directly on your iPhone!

## ✅ Prerequisites

1. **Production URL**: Your app must be deployed and accessible via HTTPS
   - Current URL: `https://nelyfit-izmfb3hmr-jorges-projects-1d31d989.vercel.app`
   - Or your custom domain if configured

2. **iPhone Requirements**:
   - iOS 11.3 or later
   - Safari browser (required for PWA installation)

## 🚀 Installation Steps

### Method 1: Add to Home Screen (Recommended)

1. **Open Safari on your iPhone** (not Chrome or other browsers)

2. **Navigate to your production URL**:
   ```
   https://nelyfit-izmfb3hmr-jorges-projects-1d31d989.vercel.app
   ```

3. **Login** with your test account:
   - Email: `client@nelsyfit.demo`
   - Password: `demo`

4. **Tap the Share button** (square with arrow pointing up) at the bottom of Safari

5. **Scroll down** and tap **"Add to Home Screen"**

6. **Customize the name** (optional - defaults to "NelsyFit")

7. **Tap "Add"** in the top right corner

8. **Done!** The app icon will appear on your home screen

### Method 2: Using Safari's Install Prompt

Some iOS versions show an install banner automatically. If you see:
- "Add NelsyFit to Home Screen" banner → Tap it
- Or look for the install icon in the Safari address bar

## 🎯 Using the Installed App

Once installed:
- **Tap the app icon** on your home screen
- The app opens in **standalone mode** (no Safari browser UI)
- Works like a native app
- **Offline support** available (cached pages work offline)
- **Push notifications** ready (when configured)

## 🔧 Troubleshooting

### App doesn't show "Add to Home Screen" option?

1. **Make sure you're using Safari** (not Chrome, Firefox, etc.)
2. **Check iOS version** - Must be iOS 11.3+
3. **Try clearing Safari cache**: Settings → Safari → Clear History and Website Data
4. **Verify HTTPS** - The site must be served over HTTPS

### App icon doesn't appear?

1. Check that icons exist in `/public/icons/` directory
2. Verify `manifest.json` is accessible at `/manifest.json`
3. Check browser console for errors

### App opens in Safari instead of standalone?

1. Make sure you opened it from the home screen icon (not Safari bookmark)
2. Check that `display: "standalone"` is set in `manifest.json` ✅ (already configured)

## 📱 Testing Checklist

- [ ] App opens from home screen
- [ ] Opens in standalone mode (no Safari UI)
- [ ] Login works
- [ ] Dashboard loads
- [ ] Workout page works
- [ ] Offline mode works (after first load)
- [ ] App icon displays correctly
- [ ] Splash screen shows on launch

## 🔄 Updating the App

When you deploy new changes:
1. The app will automatically update on next launch
2. Or force update: Delete app from home screen → Reinstall
3. Service worker will cache new version automatically

## 🎨 Customization

To customize the app icon or name:
1. Update `public/manifest.json`:
   - Change `name` or `short_name`
   - Update icon paths if needed

2. Update icons in `public/icons/` directory:
   - Replace icon files with your custom icons
   - Keep same sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

3. Redeploy to see changes

## 📊 Current Configuration

✅ **PWA Manifest**: Configured
✅ **Service Worker**: Enabled
✅ **iOS Meta Tags**: Configured
✅ **Icons**: All sizes available
✅ **Standalone Mode**: Enabled
✅ **HTTPS**: Required (Vercel provides automatically)

## 🚀 Next Steps

1. **Deploy to production** (already done via Vercel)
2. **Seed production database** (see `SEED_PRODUCTION.md`)
3. **Open in Safari on iPhone**
4. **Add to Home Screen**
5. **Test all features**

Your app is ready to install! 🎉
