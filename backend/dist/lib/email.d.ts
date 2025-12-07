interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare function sendEmail(options: EmailOptions): Promise<boolean>;
export declare function getBookingConfirmationTemplate(data: {
    customerName: string;
    bookingId: string;
    itemName: string;
    itemType: string;
    checkInDate?: string;
    checkOutDate?: string;
    eventDate?: string;
    numberOfGuests: number;
    totalAmount: number;
    confirmationNumber: string;
}): string;
export declare function getBookingStatusUpdateTemplate(data: {
    customerName: string;
    bookingId: string;
    status: 'confirmed' | 'cancelled' | 'completed' | 'no-show';
    itemName: string;
    message?: string;
}): string;
export declare function getAdminNotificationTemplate(data: {
    subject: string;
    message: string;
    details?: Record<string, any>;
}): string;
export declare function getWelcomeTemplate(data: {
    customerName: string;
}): string;
declare const _default: {
    sendEmail: typeof sendEmail;
    getBookingConfirmationTemplate: typeof getBookingConfirmationTemplate;
    getBookingStatusUpdateTemplate: typeof getBookingStatusUpdateTemplate;
    getAdminNotificationTemplate: typeof getAdminNotificationTemplate;
    getWelcomeTemplate: typeof getWelcomeTemplate;
};
export default _default;
//# sourceMappingURL=email.d.ts.map