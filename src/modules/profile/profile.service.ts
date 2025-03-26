import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UpdateProfileDto } from '../authentication/model/dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        givenName: true,
        familyName: true,
        location: true,
        website: true,
        bio: true,
        avatarImagePath: true,
        emailValidated: true,
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado.');

    return user;
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    if (updateProfileDto.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: updateProfileDto.username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('El nombre de usuario ya existe.');
      }
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        username: true,
        email: true,
        givenName: true,
        familyName: true,
        location: true,
        website: true,
        bio: true,
        avatarImagePath: true,
        emailValidated: true,
      },
    });
  }
}
