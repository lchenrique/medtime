import { defineConfig } from 'orval';

export default defineConfig({
  medtime: {
    input: '../backend/swagger.json',
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/model',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api/axios-client.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useInfinite: false,
          options: {
            staleTime: 10000,
          },
        },
      },
    },
  },
}); 