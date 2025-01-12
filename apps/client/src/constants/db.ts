import { UserDto } from "@reactive-resume/dto";

export const USER_ID = "1";
export const DEFAULT_USER_DTO: UserDto = {
  id: USER_ID,
  name: "bugyaluwang",
  picture: "https://avatars.githubusercontent.com/u/70185413?v=4",
  username: "bugyaluwang",
  email: "bugyaluwang@me.com",
  locale: "zh-CN",
  emailVerified: true,
  twoFactorEnabled: false,
  provider: "email",
  createdAt: new Date(),
  updatedAt: new Date(),
};
