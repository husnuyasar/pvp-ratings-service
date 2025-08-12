import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from './player.controller';
import { HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { PlayerService } from './player.service';

describe('PlayerController', () => {
  let controller: PlayerController;
  let service: jest.Mocked<PlayerService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<PlayerService>> = {
      get: jest.fn(),
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [{
        provide: PlayerService, useValue: serviceMock
      }]
    }).compile();

    controller = module.get<PlayerController>(PlayerController);
    service = module.get<PlayerService>(PlayerService) as jest.Mocked<PlayerService>;
    jest.clearAllMocks();
  });

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
});
