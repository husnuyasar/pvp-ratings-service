import { Test, TestingModule } from '@nestjs/testing';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { ValidationPipe } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

describe('MatchController', () => {
  let controller: MatchController;
  let service: jest.Mocked<MatchService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<MatchService>> = {
      create: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchController],
      providers: [
        {
          provide: MatchService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<MatchController>(MatchController);
    service = module.get<MatchService>(
      MatchService,
    ) as jest.Mocked<MatchService>;
    jest.clearAllMocks();
  });

  describe('CreateMatchDto validation', () => {
    const make = (body: Partial<CreateMatchDto>) =>
      plainToInstance(CreateMatchDto, body);

    const expectValid = async (body: Partial<CreateMatchDto>) => {
      const errors = await validate(make(body));
      if (errors.length) {
        throw new Error(
          `Expected valid, got errors: ${errors.map((e) => e.constraints)}`,
        );
      }
      expect(errors.length).toBe(0);
    };

    const expectInvalid = async (
      body: Partial<CreateMatchDto>,
      field: keyof CreateMatchDto,
    ) => {
      const errors = await validate(make(body));
      expect(errors.length).toBeGreaterThan(0);
      expect(hasErrorOn(errors, field)).toBe(true);
    };

    const hasErrorOn = (
      errors: ValidationError[],
      field: keyof CreateMatchDto,
    ): boolean => errors.some((e) => e.property === field);

    it('rejects non-UUID playerAId', async () => {
      await expectInvalid(
        {
          playerAId: 'fake-uuid',
          playerBId: '550e8400-e29b-41d4-a716-446655440001',
          scoreA: 1,
          scoreB: 1,
        },
        'playerAId',
      );
    });

    it('rejects non-UUID playerBId', async () => {
      await expectInvalid(
        {
          playerBId: 'fake-uuid',
          playerAId: '550e8400-e29b-41d4-a716-446655440001',
          scoreA: 1,
          scoreB: 1,
        },
        'playerBId',
      );
    });

    it('rejects negative scores', async () => {
      await expectInvalid(
        {
          playerAId: '550e8400-e29b-41d4-a716-446655440000',
          playerBId: '550e8400-e29b-41d4-a716-446655440001',
          scoreA: -1,
          scoreB: 1,
        },
        'scoreA',
      );
      await expectInvalid(
        {
          playerAId: '550e8400-e29b-41d4-a716-446655440000',
          playerBId: '550e8400-e29b-41d4-a716-446655440001',
          scoreA: 1,
          scoreB: -1,
        },
        'scoreB',
      );
    });
    it('rejects non-integer scores', async () => {
      await expectInvalid(
        {
          playerAId: '550e8400-e29b-41d4-a716-446655440000',
          playerBId: '550e8400-e29b-41d4-a716-446655440001',
          scoreA: 1.5,
          scoreB: 2,
        },
        'scoreA',
      );
      await expectInvalid(
        {
          playerAId: '550e8400-e29b-41d4-a716-446655440000',
          playerBId: '550e8400-e29b-41d4-a716-446655440001',
          scoreA: 1,
          scoreB: 2.7,
        },
        'scoreB',
      );
    });
    it('valid dto', async () => {
      await expectValid({
        playerAId: '550e8400-e29b-41d4-a716-446655440000',
        playerBId: '550e8400-e29b-41d4-a716-446655440001',
        scoreA: 1,
        scoreB: 2,
      });
    });
  });
});
