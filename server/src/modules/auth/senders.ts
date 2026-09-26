import { config } from "../../config";

/**
 * Delivers one-time codes by email and SMS.
 *
 * Email: set BREVO_API_KEY (free, 300 emails a day) or RESEND_API_KEY, plus EMAIL_FROM.
 * SMS:   set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM, or FAST2SMS_API_KEY (India).
 *
 * Without keys the code is printed to the server console. That "console"
 * mode only works outside production, and the API then also returns the code
 * to the website so a demo works end to end (shown clearly as demo mode).
 */
export type Channel = "email" | "sms";
export type Purpose = "register" | "reset" | "phone";

export interface Senders {
  email: (to: string, code: string, purpose: Purpose) => Promise<void>;
  sms: (to: string, code: string, purpose: Purpose) => Promise<void>;
  /** Which channels have a real provider */
  live: { email: boolean; sms: boolean };
}

const SUBJECT: Record<Purpose, string> = {
  register: "Your Dharohar verification code",
  reset: "Reset your Dharohar password",
  phone: "Your Dharohar verification code",
};

function emailBody(code: string, purpose: Purpose) {
  const what = purpose === "reset" ? "reset your password" : "verify your email address";
  const text = `Your Dharohar code is ${code}. Use it to ${what}. It expires in 10 minutes. If you did not ask for this, you can ignore this email.`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#241B1D">
<h2 style="color:#7A1F35;margin:0 0 12px">Dharohar</h2>
<p>Use this code to ${what}:</p>
<p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#7A1F35;margin:16px 0">${code}</p>
<p style="color:#666;font-size:13px">It expires in 10 minutes. If you did not ask for this, you can ignore this email.</p>
</div>`;
  return { text, html };
}

async function post(url: string, headers: Record<string, string>, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Delivery failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
}

const realSenders: Senders = {
  live: {
    email: !!((config.email.brevoKey || config.email.resendKey) && config.email.from),
    sms: !!((config.sms.twilioSid && config.sms.twilioToken && config.sms.twilioFrom) || config.sms.fast2smsKey),
  },

  async email(to, code, purpose) {
    const { text, html } = emailBody(code, purpose);
    const { brevoKey, resendKey, from, fromName } = config.email;
    if (brevoKey && from) {
      return post("https://api.brevo.com/v3/smtp/email", { "api-key": brevoKey }, {
        sender: { email: from, name: fromName },
        to: [{ email: to }],
        subject: SUBJECT[purpose],
        textContent: text,
        htmlContent: html,
      });
    }
    if (resendKey && from) {
      return post("https://api.resend.com/emails", { Authorization: `Bearer ${resendKey}` }, {
        from: `${fromName} <${from}>`,
        to: [to],
        subject: SUBJECT[purpose],
        text,
        html,
      });
    }
    console.log(`[otp] email to ${to}: ${code} (${purpose})`);
  },

  async sms(to, code, purpose) {
    const { twilioSid, twilioToken, twilioFrom, fast2smsKey } = config.sms;
    if (twilioSid && twilioToken && twilioFrom) {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: twilioFrom, Body: `${code} is your Dharohar verification code. It expires in 10 minutes.` }),
      });
      if (!res.ok) throw new Error(`SMS failed (${res.status})`);
      return;
    }
    if (fast2smsKey) {
      // Fast2SMS OTP route: Indian numbers, 10 digits without +91
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: { authorization: fast2smsKey, "Content-Type": "application/json" },
        body: JSON.stringify({ route: "otp", variables_values: code, numbers: to.replace(/^\+91/, "") }),
      });
      if (!res.ok) throw new Error(`SMS failed (${res.status})`);
      return;
    }
    console.log(`[otp] sms to ${to}: ${code} (${purpose})`);
  },
};

let senders: Senders = realSenders;

/** Tests swap in fake senders; pass null to restore. */
export function setSenders(s: Senders | null) {
  senders = s ?? realSenders;
}

export function getSenders(): Senders {
  return senders;
}
