const { Server } = require("socket.io");

const TAG = "src/index.js";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    const io = new Server(strapi.server.httpServer);

    io.use(async (socket, next) => {
      try {
        //Socket Authentication
        const result = await strapi.plugins[
          "users-permissions"
        ].services.jwt.verify(socket.handshake.query.token);

        //Save the User ID to the socket connection
        socket.data.user = result.id;
        next();
      } catch (error) {
        console.log(error);
      }
    }).on("connection", (socket) => {
      strapi.log.info(`${TAG}: a new user connected`);

      socket.on("join", async ({ channelName }) => {
        if (!channelName) return;

        const CHANNEL_TABLE = "api::chat.channel";
        const existingChannel = await strapi.db.query(CHANNEL_TABLE).findOne({
          where: {
            name: channelName,
          },
        });

        if (!existingChannel) {
          strapi.log.warn(
            `${TAG}: attempt to join non existent channel ${channelName} was attempted`
          );

          return;
        }

        socket.on("message", async (chatMessage) => {
          const { senderUsername, channelName, message } = chatMessage;
          if (!senderUsername || !channelName || !message) return;

          try {
            await strapi
              .query("api::chat.chat")
              .createChatMessage(senderUsername, channelName, message);

            socket.broadcast.to(channelName).emit(chatMessage);
          } catch (error) {
            strapi.log.error(`${TAG}: unable to send message, `, error);
          }
        });
      });
    });
  },
};
