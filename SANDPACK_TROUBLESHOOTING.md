# Sandpack Connection Issues - Troubleshooting Guide

## Error: "Couldn't connect to server" with "TIME_OUT"

This error occurs when Sandpack's runtime server cannot establish a connection within the expected timeframe.

## Root Causes & Solutions

### 1. **Template Mismatch** ✅ FIXED

**Problem**: Your files are configured for Vite (`vite.config.js`) but Sandpack was trying to use incompatible templates.

**Solution**:

- Vite projects are now automatically converted to use the `react` template
- `vite.config.js` is removed from the Sandpack files
- Proper `public/index.html` is added for CRA compatibility

### 2. **Empty Page with "Hello World"** ✅ FIXED

**Problem**: Sandpack shows a default "Hello World" page instead of your actual content.

**Root Causes**:

- Missing or incorrect entry point files (`src/index.js`)
- File path mismatches between Vite and CRA structures
- Incorrect active file configuration
- Missing component imports

**Solutions Applied**:

- ✅ Automatic conversion of `src/main.jsx` to `src/index.js` for CRA compatibility
- ✅ Proper file path mapping and structure conversion
- ✅ Fallback file creation if essential files are missing
- ✅ Correct active file configuration for preview mode
- ✅ Enhanced debugging and logging

### 3. **Network Connectivity Issues**

**Problem**: Network restrictions or firewall blocking Sandpack's runtime server.

**Solutions**:

- Check your network connection
- Try refreshing the page
- Clear browser cache and cookies
- Check if your firewall/antivirus is blocking the connection
- Try using a different network (mobile hotspot)

### 4. **Browser Security Restrictions**

**Problem**: Browser security policies blocking Sandpack's iframe or WebSocket connections.

**Solutions**:

- Ensure you're on HTTPS (if your site uses it)
- Check browser console for CORS errors
- Try disabling browser extensions temporarily
- Use a different browser (Chrome, Firefox, Safari)

### 5. **Sandpack Server Overload**

**Problem**: Sandpack's servers might be experiencing high load.

**Solutions**:

- Wait a few minutes and try again
- The timeout has been increased to 30 seconds
- Retry mechanism added (3 attempts with 1-second delay)

### 6. **Dependency Conflicts**

**Problem**: Incompatible package versions causing build failures.

**Solution**:

- React and React-DOM versions are now forced to `^18.2.0`
- Package.json is automatically cleaned and optimized

## Immediate Actions to Try

1. **Refresh the page** - Most common fix
2. **Clear browser cache** - Clear all site data
3. **Check browser console** - Look for specific error messages
4. **Try incognito/private mode** - Eliminates extension interference
5. **Wait 2-3 minutes** - Server might be temporarily overloaded

## Debug Information

The updated code now includes:

- ✅ Increased timeout to 30 seconds
- ✅ Retry mechanism (3 attempts)
- ✅ Better error logging
- ✅ Template auto-detection and conversion
- ✅ Dependency version fixing
- ✅ Refresh button in preview
- ✅ **File structure conversion (Vite → CRA)**
- ✅ **Automatic entry point creation**
- ✅ **Fallback file generation**
- ✅ **Enhanced debugging output**

## File Structure Requirements

For your Vite project to work in Sandpack, ensure you have:

```
/
├── public/
│   └── index.html          # ✅ Added automatically
├── src/
│   ├── index.js           # ✅ Converted from main.jsx
│   ├── App.jsx            # ✅ Your main component
│   ├── pages/
│   │   └── HeroSection.jsx # ✅ Your component
│   └── styles/
│       └── global.css     # ✅ Your styles
└── package.json           # ✅ Cleaned automatically
```

## Debugging Steps

1. **Check Browser Console**: Look for the "=== SANDPACK DEBUG INFO ===" section
2. **Verify File Conversion**: Ensure `src/main.jsx` is converted to `src/index.js`
3. **Check Active File**: In preview mode, should be `/src/index.js`
4. **Verify Dependencies**: React and React-DOM should be `^18.2.0`

## If Problem Persists

1. Check the browser console for detailed error messages
2. Try the files in a fresh browser session
3. Verify your files match the expected structure above
4. Consider using a different Sandpack template if needed

## Technical Details

The error "TIME_OUT" specifically means:

- Sandpack's bundler couldn't start within the timeout period
- The runtime server didn't respond to the connection request
- Network latency exceeded the default timeout

The fixes implemented:

- Increased timeout from default to 30 seconds
- Added reconnection logic
- Improved template detection
- Better error handling and logging
- **File structure conversion for CRA compatibility**
- **Automatic fallback file generation**
