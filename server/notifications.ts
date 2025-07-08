import { storage } from "./storage";

interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'fee_reminder' | 'payment_received' | 'attendance_alert' | 'general';
}

export async function sendWhatsAppNotification(message: WhatsAppMessage) {
  try {
    // In a real implementation, you would integrate with WhatsApp Business API
    // For now, we'll store these as communications in the database
    
    await storage.createCommunication({
      type: 'whatsapp',
      recipient: message.to,
      subject: getSubjectByType(message.type),
      content: message.message,
      status: 'sent',
      sentAt: new Date(),
      metadata: { messageType: message.type }
    });

    console.log(`WhatsApp message sent to ${message.to}: ${message.message}`);
    return { success: true, messageId: `wa_${Date.now()}` };
  } catch (error) {
    console.error("WhatsApp notification error:", error);
    throw new Error("Failed to send WhatsApp notification");
  }
}

function getSubjectByType(type: string): string {
  switch (type) {
    case 'fee_reminder': return 'Fee Payment Reminder';
    case 'payment_received': return 'Payment Confirmation';
    case 'attendance_alert': return 'Attendance Alert';
    default: return 'Academy Notification';
  }
}

export async function sendFeeReminder(studentId: number, amount: number, dueDate: string) {
  try {
    const student = await storage.getStudent(studentId);
    if (!student?.phone) {
      throw new Error("Student phone number not found");
    }

    const message = `
Hi ${student.name},

This is a friendly reminder that your monthly fee payment of ₹${amount} is due on ${dueDate}.

Please pay at your earliest convenience to avoid any service interruption.

Thank you!
Parmanand Sports Academy
    `.trim();

    return await sendWhatsAppNotification({
      to: student.phone,
      message,
      type: 'fee_reminder'
    });
  } catch (error) {
    console.error("Fee reminder error:", error);
    throw new Error("Failed to send fee reminder");
  }
}

export async function sendPaymentConfirmation(studentId: number, amount: number, paymentMethod: string) {
  try {
    const student = await storage.getStudent(studentId);
    if (!student?.phone) {
      throw new Error("Student phone number not found");
    }

    const message = `
Hi ${student.name},

Your payment of ₹${amount} has been successfully received via ${paymentMethod}.

Thank you for your payment!
Parmanand Sports Academy
    `.trim();

    return await sendWhatsAppNotification({
      to: student.phone,
      message,
      type: 'payment_received'
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    throw new Error("Failed to send payment confirmation");
  }
}

export async function sendAttendanceAlert(studentId: number, absentDays: number) {
  try {
    const student = await storage.getStudent(studentId);
    if (!student?.phone) {
      throw new Error("Student phone number not found");
    }

    const message = `
Hi ${student.name},

We noticed you've been absent for ${absentDays} consecutive days. 

Please contact us if you need any assistance or have any concerns.

Parmanand Sports Academy
    `.trim();

    return await sendWhatsAppNotification({
      to: student.phone,
      message,
      type: 'attendance_alert'
    });
  } catch (error) {
    console.error("Attendance alert error:", error);
    throw new Error("Failed to send attendance alert");
  }
}

export async function sendBulkNotification(recipients: string[], message: string) {
  try {
    const promises = recipients.map(phone => 
      sendWhatsAppNotification({
        to: phone,
        message,
        type: 'general'
      })
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      total: recipients.length,
      successful,
      failed,
      results
    };
  } catch (error) {
    console.error("Bulk notification error:", error);
    throw new Error("Failed to send bulk notifications");
  }
}