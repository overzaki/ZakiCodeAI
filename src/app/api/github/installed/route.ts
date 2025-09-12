import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const installation_id = url.searchParams.get('installation_id');
  const setup_action = url.searchParams.get('setup_action');
  const account_login = url.searchParams.get('account_login') || null;
  const account_type = url.searchParams.get('account_type') || null;

  console.log('GitHub installation callback:', { 
    installation_id, 
    setup_action, 
    account_login, 
    account_type 
  });

  if (!installation_id) {
    console.error('Missing installation_id in GitHub callback');
    return NextResponse.redirect(new URL('/?github=error&message=missing_installation_id', req.url));
  }

  // Create a success page that will handle localStorage storage on the client side
  const successPage = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>GitHub Connected - ZakiCode</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .title {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .message {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        .details {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
          font-family: monospace;
          font-size: 0.9rem;
        }
        .button {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
          text-decoration: none;
          display: inline-block;
        }
        .button:hover {
          background: #45a049;
        }
        .auto-redirect {
          margin-top: 1rem;
          opacity: 0.7;
          font-size: 0.9rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✅</div>
        <div class="title">GitHub Connected Successfully!</div>
        <div class="message">
          Your GitHub account has been connected to ZakiCode.
        </div>
        <div class="details">
          Installation ID: ${installation_id}<br>
          Account: ${account_login || 'Unknown'}<br>
          Type: ${account_type || 'Unknown'}
        </div>
        <a href="/" class="button">Return to ZakiCode</a>
        <div class="auto-redirect">
          You will be redirected automatically in <span id="countdown">5</span> seconds...
        </div>
      </div>

      <script>
        // Store GitHub connection details in localStorage
        console.log('Storing GitHub connection details...');
        localStorage.setItem('gh_installation_id', '${installation_id}');
        localStorage.setItem('gh_account_login', '${account_login || ''}');
        localStorage.setItem('gh_account_type', '${account_type || ''}');
        localStorage.setItem('gh_connected_at', new Date().toISOString());
        
        console.log('GitHub connection stored:', {
          installation_id: '${installation_id}',
          account_login: '${account_login || ''}',
          account_type: '${account_type || ''}',
          connected_at: new Date().toISOString()
        });

        // Auto-redirect countdown
        let countdown = 5;
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
          countdown--;
          countdownElement.textContent = countdown;
          
          if (countdown <= 0) {
            clearInterval(timer);
            window.location.href = '/?github=connected&installation_id=${installation_id}';
          }
        }, 1000);

        // Try to store in database as well (optional)
        fetch('/api/github/store-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            installation_id: '${installation_id}',
            account_login: '${account_login || ''}',
            account_type: '${account_type || ''}'
          })
        }).catch(err => console.log('Database storage failed (optional):', err));
      </script>
    </body>
    </html>
  `;

  return new NextResponse(successPage, {
    headers: { 'Content-Type': 'text/html' },
  });
}
