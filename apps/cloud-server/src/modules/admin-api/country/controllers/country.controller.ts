import { CountryService } from '@domain/country/services/country.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateResponseDto, RequireSession, SuccessResponseDto, UserId } from '@vritti/api-sdk';
import { SessionTypeValues } from '@/db/schema';
import {
  ApiCreateCountry,
  ApiDeleteCountry,
  ApiFindForTableCountries,
  ApiGetCountryById,
  ApiUpdateCountry,
} from '../docs/country.docs';
import { CountryDto } from '../dto/entity/country.dto';
import { CreateCountryDto } from '../dto/request/create-country.dto';
import { UpdateCountryDto } from '../dto/request/update-country.dto';
import { CountryTableResponseDto } from '../dto/response/countries-response.dto';

@ApiTags('Admin - Countries')
@ApiBearerAuth()
@RequireSession(SessionTypeValues.ADMIN)
@Controller('countries')
export class CountryController {
  private readonly logger = new Logger(CountryController.name);

  constructor(private readonly countryService: CountryService) {}

  // Creates a new country
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateCountry()
  create(@Body() dto: CreateCountryDto): Promise<CreateResponseDto<CountryDto>> {
    this.logger.log('POST /admin-api/countries');
    return this.countryService.create(dto);
  }

  // Returns countries for the data table with server-stored filter/sort/search/pagination state
  @Get('table')
  @ApiFindForTableCountries()
  findForTable(@UserId() userId: string): Promise<CountryTableResponseDto> {
    this.logger.log('GET /admin-api/countries/table');
    return this.countryService.findForTable(userId);
  }

  // Returns a single country by ID
  @Get(':id')
  @ApiGetCountryById()
  findById(@Param('id') id: string): Promise<CountryDto> {
    this.logger.log(`GET /admin-api/countries/${id}`);
    return this.countryService.findById(id);
  }

  // Updates a country by ID
  @Patch(':id')
  @ApiUpdateCountry()
  update(@Param('id') id: string, @Body() dto: UpdateCountryDto): Promise<SuccessResponseDto> {
    this.logger.log(`PATCH /admin-api/countries/${id}`);
    return this.countryService.update(id, dto);
  }

  // Deletes a country by ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteCountry()
  delete(@Param('id') id: string): Promise<SuccessResponseDto> {
    this.logger.log(`DELETE /admin-api/countries/${id}`);
    return this.countryService.delete(id);
  }
}
