export type Attachment = {
  filename: string;
  content: Buffer;
};

export type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Attachment[];
};

export type SendEmailResult = {
  messageId: string;
};
