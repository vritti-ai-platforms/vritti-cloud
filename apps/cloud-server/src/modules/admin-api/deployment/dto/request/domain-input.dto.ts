import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '@vritti/api-sdk/decorators';
import { IsFQDN, IsNotEmpty, IsString } from 'class-validator';

export class DomainInputDto {
  @ApiProperty({
    description: 'Hostname the managed edge serves + issues a cert for',
    example: 'api.apw1.vrittiai.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsFQDN()
  @Trim({ nullify: false })
  host: string;

  @ApiProperty({ description: 'Upstream service:port the host proxies to', example: 'core-server:3002' })
  @IsString()
  @IsNotEmpty()
  @Trim({ nullify: false })
  upstream: string;
}
