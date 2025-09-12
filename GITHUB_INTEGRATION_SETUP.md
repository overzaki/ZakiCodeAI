# GitHub Integration Setup Guide

This guide explains how to set up GitHub integration in ZakiCode to push generated code directly to GitHub repositories.

## 🚀 **What We've Built**

### ✅ **Complete GitHub Integration Features:**
1. **GitHub App Authentication** - Secure app-based authentication
2. **Repository Management** - List and select repositories
3. **Code Push Functionality** - Push generated code with proper commit messages
4. **UI Integration** - GitHub button in editor preview section
5. **Error Handling** - Comprehensive error messages and user feedback

## 🔧 **Setup Instructions**

### **Step 1: Create a GitHub App**

1. **Go to GitHub Settings:**
   - Visit: https://github.com/settings/apps
   - Click "New GitHub App"

2. **Configure the App:**
   ```
   GitHub App name: ZakiCode (or your preferred name)
   Homepage URL: https://zakicode.ai (or your domain)
   Callback URL: https://your-domain.com/api/github/installed
   Webhook URL: (leave empty for now)
   ```

3. **Set Permissions:**
   - **Repository permissions:**
     - Contents: Read & Write
     - Metadata: Read
     - Pull requests: Read (optional)
   
   - **Account permissions:**
     - Email addresses: Read (optional)

4. **Generate Private Key:**
   - Scroll down and click "Generate a private key"
   - Download the `.pem` file securely

5. **Note Your App ID:**
   - Copy the App ID from the app settings page

### **Step 2: Environment Variables**

Add these environment variables to your `.env.local` file:

```bash
# GitHub App Configuration
GITHUB_APP_ID=your_app_id_here
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
(paste entire private key here)
...
-----END RSA PRIVATE KEY-----"

# GitHub App Slug (for installation URL)
NEXT_PUBLIC_GITHUB_APP_SLUG=your-app-slug
```

**Important Notes:**
- Replace `your_app_id_here` with your actual App ID
- Replace the private key with your actual `.pem` file content
- Replace `your-app-slug` with your GitHub App's slug (found in app URL)

### **Step 3: Install Dependencies**

The following dependencies are already included:
```bash
npm install octokit jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### **Step 4: Database Setup (Optional)**

If you want to store GitHub connections in your database, create this table:

```sql
CREATE TABLE user_github_links (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  installation_id BIGINT NOT NULL,
  account_login TEXT,
  account_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, installation_id)
);
```

## 🎯 **How to Use**

### **For Users:**

1. **Connect GitHub:**
   - Click the GitHub button in the editor
   - It will redirect to GitHub for app installation
   - Select repositories you want ZakiCode to access
   - Approve the installation

2. **Push Code:**
   - Generate some code in ZakiCode
   - Click the GitHub button (🐙) in the preview section
   - Code will be pushed to your selected repository

### **For Developers:**

1. **Setting Installation ID:**
   ```javascript
   // The app automatically saves installation_id to localStorage
   localStorage.setItem('gh_installation_id', 'your_installation_id');
   ```

2. **Setting Default Repository:**
   ```javascript
   localStorage.setItem('gh_default_repo', 'username/repository-name');
   ```

## 📁 **File Structure**

```
src/
├── app/api/github/
│   ├── commit/route.ts          # Main push functionality
│   ├── repos/route.ts           # List repositories
│   ├── token.ts                 # GitHub token management
│   └── installed/route.ts       # Installation callback
├── sections/Editor/
│   ├── EditorPageSection/
│   │   └── editorPageSection.tsx # GitHub integration logic
│   └── components/
│       └── EditorPreviewSection.tsx # GitHub button UI
```

## 🔄 **API Endpoints**

### **POST /api/github/commit**
Pushes code files to a GitHub repository.

**Request Body:**
```json
{
  "installation_id": "12345678",
  "repo_full_name": "username/repository",
  "files": {
    "/src/App.js": { "code": "React code here..." },
    "/package.json": { "code": "{...}" }
  },
  "projectId": "project-123",
  "dir": "projects/my-project",
  "branch": "main"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Successfully pushed 5 file(s) to username/repository",
  "pushedFiles": 5,
  "repositoryUrl": "https://github.com/username/repository",
  "projectPath": "projects/my-project"
}
```

### **GET /api/github/repos**
Lists accessible repositories for an installation.

**Query Parameters:**
- `installation_id`: GitHub installation ID

## 🛠 **Code Integration**

### **Push Generated Code:**
```typescript
const handleGitHubPush = async () => {
  const response = await fetch('/api/github/commit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      installation_id: gitHubInstallationId,
      repo_full_name: gitHubRepo,
      files: generatedCodeFiles,
      projectId: projectId,
      dir: `projects/${projectName}`
    }),
  });
  
  const result = await response.json();
  if (result.ok) {
    console.log('✅ Code pushed successfully!');
  }
};
```

## 🔒 **Security Notes**

1. **Private Key Security:**
   - Never commit your private key to version control
   - Use environment variables only
   - Rotate keys periodically

2. **Installation ID:**
   - Stored in localStorage for convenience
   - Consider encrypting in production
   - Validate on server-side

3. **Repository Access:**
   - Users control which repositories the app can access
   - App can only push to approved repositories
   - GitHub provides audit logs for all activities

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **"Missing required fields" error:**
   - Ensure GitHub is connected (`installation_id` exists)
   - Select a repository (`repo_full_name` set)

2. **Authentication failures:**
   - Check `GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY`
   - Verify private key format (include headers/footers)
   - Ensure app is installed on the target repository

3. **Permission denied:**
   - Reinstall the GitHub app with proper permissions
   - Verify repository access in GitHub app settings

4. **Network errors:**
   - Check GitHub API status
   - Verify environment variables are loaded
   - Review server logs for detailed errors

## 🎉 **Success Flow**

1. ✅ User generates code in ZakiCode
2. ✅ Clicks GitHub button
3. ✅ Code is formatted with README
4. ✅ Files are pushed to `projects/project-name/` in repository
5. ✅ User gets success notification with repository link
6. ✅ Code is immediately available on GitHub

## 🔗 **References**

- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps)
- [Octokit.js Documentation](https://github.com/octokit/octokit.js)
- [GitHub API Reference](https://docs.github.com/en/rest)

---

**Generated by ZakiCode AI** 🤖 | [Visit ZakiCode](https://zakicode.ai)
