# Authentication Setup with Redux Toolkit Query

This document describes the authentication system implemented using Redux Toolkit Query (RTK Query) for the ZakiCode application.

## Overview

The authentication system includes:

- User registration (sign up)
- User login (sign in)
- User logout
- Protected routes
- Token-based authentication
- Persistent authentication state

## Environment Configuration

The API base URL is configured in `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=https://overzakiar.app.n8n.cloud
```

## File Structure

### Redux Store

- `src/redux/store/store.tsx` - Main Redux store configuration
- `src/redux/slices/authSlice.ts` - Authentication state management
- `src/redux/api/authApi.ts` - RTK Query API endpoints

### Components

- `src/components/ProtectedRoute/` - Route protection component
- `src/components/LogoutButton/` - Logout functionality
- `src/components/UserProfile/` - User profile display

### Hooks

- `src/hooks/useAuth.ts` - Custom authentication hook

### Pages

- `src/sections/Auth/SignUp/` - Sign up page
- `src/sections/Auth/SignIn/` - Sign in page

## API Endpoints

The following endpoints are configured in the RTK Query API:

- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh token

## Usage

### Using the useAuth Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, isLoading, error, signUp, signIn, logout } =
    useAuth();

  const handleSignUp = async () => {
    const result = await signUp({
      email: 'user@example.com',
      password: 'password123',
    });

    if (result.success) {
      // User signed up successfully
    }
  };

  const handleSignIn = async () => {
    const result = await signIn({
      email: 'user@example.com',
      password: 'password123',
    });

    if (result.success) {
      // User signed in successfully
    }
  };

  const handleLogout = async () => {
    await logout();
    // User logged out and redirected to signin page
  };
};
```

### Protected Routes

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

// Require authentication
<ProtectedRoute requireAuth={true}>
  <MyProtectedComponent />
</ProtectedRoute>

// Prevent authenticated users from accessing (e.g., auth pages)
<ProtectedRoute requireAuth={false}>
  <SignInPage />
</ProtectedRoute>
```

### User Profile Component

```typescript
import UserProfile from '@/components/UserProfile';

// Display user profile with logout option
<UserProfile />
```

### Logout Button

```typescript
import LogoutButton from '@/components/LogoutButton';

// Simple logout button
<LogoutButton />

// Custom styled logout button
<LogoutButton
  variant="outlined"
  color="error"
  sx={{ borderRadius: 2 }}
>
  Sign Out
</LogoutButton>
```

## State Management

### Authentication State

The authentication state includes:

- `user`: Current user object (id, email, name)
- `token`: JWT token for API requests
- `isAuthenticated`: Boolean indicating authentication status
- `isLoading`: Loading state for auth operations
- `error`: Error message if any

### Persistence

Authentication state is persisted in localStorage:

- `auth-token`: JWT token
- `auth-user`: User object

## Security Features

1. **Token-based Authentication**: JWT tokens are automatically included in API requests
2. **Automatic Token Refresh**: Tokens can be refreshed when needed
3. **Route Protection**: Unauthenticated users are redirected to signin page
4. **Secure Logout**: Tokens are cleared from both state and localStorage
5. **Error Handling**: Comprehensive error handling for auth operations

## API Response Format

Expected API response format:

```typescript
interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token: string;
  message?: string;
}
```

## Error Handling

The system handles various error scenarios:

- Network errors
- Invalid credentials
- Server errors
- Token expiration

Errors are displayed to users via Material-UI Alert components and can be cleared programmatically.

## Integration with Existing Code

The authentication system integrates seamlessly with:

- Next.js App Router
- Material-UI components
- Internationalization (next-intl)
- Existing Redux store structure

## Future Enhancements

Potential improvements:

- Social authentication (Google, GitHub)
- Two-factor authentication
- Password reset functionality
- Email verification
- Role-based access control
- Session management
