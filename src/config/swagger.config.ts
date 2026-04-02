import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
  .setTitle("Knowledge Hub API")
  .setDescription("API for Knowledge Hub Task")
  .addTag("User", "Users")
  .build();
