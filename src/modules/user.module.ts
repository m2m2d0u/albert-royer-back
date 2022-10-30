import { forwardRef, Module } from "@nestjs/common";
import { UserService } from "@services";
import { UserController } from "@controllers";
import { User, UserSchema } from "@entities";
import { MongooseModule } from "@nestjs/mongoose";
import { RoleModule, SubtestModule } from "@modules";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => RoleModule),
    forwardRef(() => SubtestModule)
  ],
  providers: [UserService],
  exports: [MongooseModule, UserService],
  controllers: [UserController]
})
export class UserModule {}
