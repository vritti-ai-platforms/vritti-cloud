import { DeploymentDomainModule } from '@domain/deployment/deployment.module';
import { Module } from '@nestjs/common';
import { DeploymentController } from './controllers/deployment.controller';

@Module({
  imports: [DeploymentDomainModule],
  controllers: [DeploymentController],
})
export class AdminDeploymentModule {}
