import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from './player.controller';
import {
  BadRequestException,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';

describe('PlayerController', () => {
  let controller: PlayerController;
  let service: jest.Mocked<PlayerService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<PlayerService>> = {
      get: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        {
          provide: PlayerService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<PlayerController>(PlayerController);
    service = module.get<PlayerService>(
      PlayerService,
    ) as jest.Mocked<PlayerService>;
    jest.clearAllMocks();
  });

  // get endpoint
  it('ParseUUIDPipe validations', async () => {
    const pipe = new ParseUUIDPipe({ version: '4' });

    // correct one
    await expect(
      pipe.transform('d9ce350e-029a-44c0-a878-a3c64db6d359', {
        type: 'param',
        metatype: String,
        data: 'id',
      }),
    ).resolves.toBe('d9ce350e-029a-44c0-a878-a3c64db6d359');

    // wrong id
    await expect(
      pipe.transform('fake-uuid', {
        type: 'param',
        metatype: String,
        data: 'id',
      }),
    ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
  });

  // create endpoint
  describe('CreatePlayerDto validation', () => {
    const pipe = new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validateCustomDecorators: true,
    });

    const validateDto = (body: any) =>
      pipe.transform(body, {
        type: 'body',
        metatype: CreatePlayerDto,
        data: '',
      });

    it('Valid username', async () => {
      const dto = await validateDto({ username: 'ash123' });
      expect(dto).toBeInstanceOf(CreatePlayerDto);
      expect(dto.username).toBe('ash123');
    });

    it('Empty username', async () => {
      await expect(validateDto({ username: '' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('Non-alphanumeric username', async () => {
      await expect(validateDto({ username: 'ash_123' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('Non-string username', async () => {
      await expect(validateDto({ username: 123 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
