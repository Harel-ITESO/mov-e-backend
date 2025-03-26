import { Controller, Get, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from '../authentication/model/dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get(':id')
  getProfile(@Param('id', ParseIntPipe) userId: number) {
    return this.profileService.getProfile(userId);
  }

  @Patch(':id')
  updateProfile(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(userId, updateProfileDto);
  }
}
