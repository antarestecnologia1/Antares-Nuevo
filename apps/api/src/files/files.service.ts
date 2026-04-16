import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js";

@Injectable()
export class FilesService {
  private readonly client;

  constructor(config: ConfigService) {
    const url = config.get<string>("SUPABASE_URL") ?? "";
    const key = config.get<string>("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    this.client = createClient(url, key);
  }

  async upload(buffer: Buffer, fileName: string, bucket = "trip-files") {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(fileName, buffer, { upsert: true });

    if (error) throw error;
    return data;
  }
}
