declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    NODE_ENV?: 'development' | 'test' | 'production'
    PORT?: string
    REDIS_URL?: string
  }
}
