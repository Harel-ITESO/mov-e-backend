import { Controller } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

// http://localhost:8080/v1/api/authentication
@Controller('authentication')
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
    ) {}
}
