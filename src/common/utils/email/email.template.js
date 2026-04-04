export const emailTemplate = (otp) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>

<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 20px;">
        
        <!-- Main Container -->
        <table width="500" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:10px; padding:20px;">
          
          <!-- Logo / App Name -->
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h2 style="margin:0; color:#333;">Saraha App</h2>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="text-align:center;">
              <h3 style="color:#333;">Email Verification</h3>
              <p style="color:#777;">Use the code below to verify your account</p>
            </td>
          </tr>

          <!-- OTP Code -->
          <tr>
            <td align="center" style="padding: 20px 0;">
              <div style="
                display:inline-block;
                padding:15px 30px;
                font-size:28px;
                letter-spacing:5px;
                background:#f1f1f1;
                border-radius:8px;
                color:#333;
                font-weight:bold;
              ">
                {${otp}}
              </div>
            </td>
          </tr>

          <!-- Expiry -->
          <tr>
            <td style="text-align:center;">
              <p style="color:#999; font-size:14px;">
                This code will expire in 5 minutes.
              </p>
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td style="text-align:center; padding-top:10px;">
              <p style="color:#999; font-size:13px;">
                If you didn’t request this, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center; padding-top:20px;">
              <p style="color:#ccc; font-size:12px;">
                © 2026 Saraha App. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
}