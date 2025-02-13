declare global {
  var sseClients: Map<string, any>
}
// Declare module para estender o tipo do JWT
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: BaseUser;
  }
} 
export {} 