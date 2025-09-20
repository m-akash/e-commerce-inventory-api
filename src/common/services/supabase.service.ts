import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }) as SupabaseClient<any, 'public', 'public', any, any>;
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getStorage() {
    return this.supabase.storage;
  }
}
