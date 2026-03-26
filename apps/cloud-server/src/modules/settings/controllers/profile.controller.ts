import { Body, Controller, Delete, Logger, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequireSession, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import { SessionService } from '@domain/session/services/session.service';
import { UserService } from '@domain/user/services/user.service';
import { UserDto } from '../../cloud-api/user/dto/entity/user.dto';
import { UpdateUserDto } from '../../cloud-api/user/dto/request/update-user.dto';
import { ApiDeleteAccount, ApiUpdateProfile } from '../docs/profile.docs';

@ApiTags('Settings - Profile')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.CLOUD, SessionTypeValues.ADMIN)
@Controller('settings')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  // Updates the authenticated user's profile information
  @Put('profile')
  @ApiUpdateProfile()
  async updateProfile(@UserId() userId: string, @Body() updateUserDto: UpdateUserDto): Promise<UserDto> {
    this.logger.log(`PUT /settings/profile - Updating profile for user: ${userId}`);
    return this.userService.update(userId, updateUserDto);
  }

  // Deactivates the authenticated user's account and invalidates all sessions
  @Delete('account')
  @ApiDeleteAccount()
  async deleteAccount(@UserId() userId: string): Promise<{ message: string }> {
    this.logger.log(`DELETE /settings/account - Deleting account for user: ${userId}`);
    await this.userService.deactivate(userId);
    await this.sessionService.invalidateAllUserSessions(userId);
    this.logger.log(`Account deleted and all sessions invalidated for user: ${userId}`);
    return { message: 'Account successfully deleted' };
  }
}
