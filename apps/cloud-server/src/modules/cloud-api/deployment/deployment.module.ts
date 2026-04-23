import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { Module } from '@nestjs/common';
import { CloudDeploymentController } from './controllers/deployment.controller';

@Module({
  imports: [DeploymentDomainModule],
  controllers: [CloudDeploymentController],
})
export class CloudDeploymentModule {}
