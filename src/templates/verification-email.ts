export const renderVerificationEmail = (code: string, isLogin: boolean = false) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .code { 
            font-size: 24px; 
            letter-spacing: 5px; 
            padding: 10px 20px; 
            background: #f4f4f4; 
            display: inline-block;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${isLogin ? 'Login' : 'Email'} Verification</h2>
          <p>Please use the following verification code to ${isLogin ? 'complete your login' : 'verify your email address'}:</p>
          <div class="code">${code}</div>
          <p>This code will expire in ${isLogin ? '15 minutes' : '30 minutes'}.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </body>
      </html>
    `;
  };