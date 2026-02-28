import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { MailerService, ISendMailOptions } from "@nestjs-modules/mailer";
import { SentMessageInfo } from "nodemailer";
import * as path from "path";
import { User } from "src/user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { createHash, randomBytes } from "crypto";
import { scrypt as _scrypt } from "crypto";
import { promisify } from "util";
const scrypt = promisify(_scrypt);

type TEmailOptions = ISendMailOptions & { linkURL: string };

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(
    private readonly emailService: MailerService,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private dataSource: DataSource,
  ) {}

  async sendEmail(infos: TEmailOptions): Promise<SentMessageInfo> {
    try {
      const options: ISendMailOptions = {
        to: infos.to,
        subject: infos.subject,
        template: path.resolve("templates", "reset-password"),
        context: {
          message: infos.linkURL,
        },
      };
      const result = this.emailService.sendMail(options);
      this.logger.log("Email enviado com sucesso: ", result);
      return result;
    } catch (error) {
      this.logger.error("Falha ao enviar email", error);
      throw error;
    }
  }

  async forgotPassword(
    email: string,
  ): Promise<{ message: string; linkURL?: string }> {
    const user = await this.userRepository.findOne({
      where: { email: email },
      withDeleted: true,
    });
    if (!user) {
      return { message: "E-mail sent" };
    }

    const existResetToken = await this.userRepository.findOne({
      where: { user_id: user.user_id },
      withDeleted: true,
    });
    if (existResetToken?.reset_token) {
      await this.userRepository.update(user.user_id, {
        reset_token: "",
        reset_token_expiry: 0,
      });
    }

    const resetToken = randomBytes(32).toString("hex");
    const hash = createHash("sha256").update(resetToken).digest("hex");
    console.log(hash);
    const linkURL: string = `http://localhost:3000/token?=${resetToken}`;

    const options: TEmailOptions = {
      to: user.email,
      subject: "Restore your password",
      linkURL: linkURL,
    };

    await this.userRepository.update(user.user_id, {
      reset_token: hash,
      reset_token_expiry: new Date().getTime(),
    });

    this.sendEmail(options)
      .then((data) => console.log(data))
      .catch((error) => {
        console.error(error);
      });

    return {
      message: "E-mail sent",
      linkURL: linkURL,
    };
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ message: string }> {
    const hashToken = createHash("sha256").update(token).digest("hex");
    const hashStoredToken = await this.userRepository.findOne({
      where: {
        reset_token: hashToken,
      },
      withDeleted: true,
    });

    if (!hashStoredToken) {
      throw new HttpException(
        "Invalid password reset token",
        HttpStatus.BAD_REQUEST,
      );
    }

    const userID = hashStoredToken.user_id; // Token existe

    //Agora sabemos que o token existe, então ele é válido. Iniciamos uma transação para resetar a senha.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const tokenUser = await queryRunner.manager.findOne(User, {
        where: { user_id: userID },
        withDeleted: true,
      });

      // Procuramos a linha que corresponde ao hash do token de entrada, para garantir que outra transação não tenha resgatado ela já.
      let matchedRow: User | null = null;

      if (tokenUser?.reset_token === hashToken) {
        matchedRow = tokenUser;
      }

      if (
        matchedRow === null ||
        matchedRow === undefined ||
        !matchedRow?.reset_token ||
        !matchedRow.reset_token_expiry
      ) {
        // O token foi resgatado por outra transação. Então saímos.
        throw new HttpException(
          "Invalid password reset token",
          HttpStatus.NOT_FOUND,
        );
      }

      // Agora vamos deletar todos os tokens pertencentes a este usuário para evitar uso duplicado.
      await queryRunner.manager.update(User, matchedRow.user_id, {
        reset_token: "",
        reset_token_expiry: 0,
      });

      // Agora verificamos se o token atual expirou ou não.
      const currentTime = new Date().getTime();
      const tenMinutesInMillis = 15 * 60 * 1000; // 15 minutos em milissegundos
      const expirationTime =
        currentTime - Number(matchedRow.reset_token_expiry);

      if (expirationTime > tenMinutesInMillis) {
        throw new HttpException(
          "Token has expired. Please try again",
          HttpStatus.GONE,
        );
      }

      // Agora todas as verificações foram concluídas. Podemos alterar a senha do usuário.
      const salt = randomBytes(8).toString("hex"); // salt único por cadastro
      const hashPassword = (await scrypt(password, salt, 32)) as Buffer;

      // Junção do salt com a senha criptografada
      const saltAndHashPassword = `${salt}.${hashPassword.toString("hex")}`;

      const updatedPasword = await queryRunner.manager.update(
        User,
        matchedRow.user_id,
        {
          password: saltAndHashPassword,
        },
      );

      console.log("Alterou a senha: ", updatedPasword.affected);
      await queryRunner.commitTransaction();
      return {
        message: "Password changed successfully",
      };
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
