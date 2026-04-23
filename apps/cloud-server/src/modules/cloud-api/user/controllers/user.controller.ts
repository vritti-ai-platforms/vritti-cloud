import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiFindAllUsers, ApiFindUserById } from '../docs/user.docs';
import { UserDto } from '../dto/entity/user.dto';
import { UserService } from '@domain/user/services/user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  // Retrieves all users in the system
  @Get()
  @ApiFindAllUsers()
  async findAll(): Promise<UserDto[]> {
    this.logger.log('GET /users - Fetching all users');
    return await this.userService.findAll();
  }

  // Retrieves a single user by their unique identifier
  @Get(':id')
  @ApiFindUserById()
  async findById(@Param('id') id: string): Promise<UserDto> {
    this.logger.log(`GET /users/${id} - Fetching user by ID`);
    return await this.userService.findById(id);
  }
}
