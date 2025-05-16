import { UserWithoutPassword } from 'src/modules/user/model/types/user-without-password';

export interface Profile extends UserWithoutPassword {
    userFollowsAccount: boolean;
    accountFollowsUser: boolean;
}
