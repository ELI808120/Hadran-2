
/**
 * EmailJS Integration Service
 * Instructions:
 * 1. Register at emailjs.com
 * 2. Connect your email service (Gmail/Outlook)
 * 3. Create a template with variables: {{customer_name}}, {{event_date}}, {{location}}, {{order_link}}
 * 4. Set the env variables in your deployment platform
 */

export const emailService = {
  async sendApprovalEmail(params: {
    customer_name: string;
    customer_email: string;
    event_date: string;
    location: string;
    order_link: string;
  }) {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn("EmailJS environment variables are missing. Falling back to console log.");
      console.log("Email Simulation:", params);
      return;
    }

    try {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            customer_name: params.customer_name,
            to_email: params.customer_email,
            event_date: params.event_date,
            location: params.location,
            order_link: params.order_link,
            reply_to: "hadran@catering.com"
          }
        })
      });

      if (!response.ok) throw new Error("Failed to send email via EmailJS");
      return true;
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  }
};
