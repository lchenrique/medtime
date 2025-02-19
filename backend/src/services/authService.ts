import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { RegisterInput, LoginInput } from '../schemas/auth';
import { AppError } from '../errors/AppError';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(userData: RegisterInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });
    
    if (existingUser) {
      throw new AppError('Email já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        fcmToken: null,
        whatsappEnabled: false,
        whatsappNumber: null,
        telegramEnabled: false,
        telegramChatId: null,
        timezone: "America/Sao_Paulo",
        isDiabetic: false,
        hasHeartCondition: false,
        hasHypertension: false,
        allergies: null,
        observations: null,
        tauriEnabled: false,
        capacitorEnabled: false
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    if (!user.password) {
      throw new Error('Credenciais inválidas');
    }
    const isValidPassword = await bcrypt.compare(input.password, user.password);

    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    const { password, ...userWithoutPassword } = user;

    return {
      token: 'mock-token', // Will be replaced by real JWT in controller
      user: userWithoutPassword
    };
  }
}