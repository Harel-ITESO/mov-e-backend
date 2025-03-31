import { isURL } from 'class-validator';
import { SendData } from 'src/services/aws/ses/models/types/send-data';

export abstract class EmailVerificationOptionsFactory {
    public static getEmailOptions(to: string[], verificationLink: string) {
        if (!isURL(verificationLink))
            throw new Error('Verification link must be an error');
        return {
            toAddresses: [...to],
            subject: 'Verify you E-mail on Mov-E',
            text: 'To use Mov-E you are required to verify your email, please continue the following instructions.',
            html: `<h1>Continue to the application with the following link: <a href="${verificationLink}">${verificationLink}</a></h1>`,
        } as SendData;
    }
}
