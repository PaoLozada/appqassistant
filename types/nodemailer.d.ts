declare module "nodemailer" {
  export interface TransportOptions {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }

  export interface SendMailOptions {
    from: string
    to: string
    subject: string
    text?: string
    html?: string
    attachments?: Array<{
      filename: string
      content: string
      contentType?: string
    }>
  }

  export interface Transporter {
    sendMail(options: SendMailOptions): Promise<{
      messageId: string
      [key: string]: any
    }>
  }

  export function createTransport(options: TransportOptions): Transporter
}

