import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js";

@Injectable()
export class FilesService {
  private readonly client;
  private readonly enabled: boolean;

  constructor(config: ConfigService) {
    const url = config.get<string>("SUPABASE_URL") ?? "";
    const key = config.get<string>("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    this.enabled = Boolean(url && key);
    this.client = this.enabled ? createClient(url, key) : null;
  }

  async upload(buffer: Buffer, fileName: string, bucket = "trip-files") {
    if (!this.enabled || !this.client) {
      throw new Error(
        "Servicio de archivos no configurado. Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY."
      );
    }
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(fileName, buffer, { upsert: true });

    if (error) throw error;
    return data;
  }
}
