const getChannelChat = async (channelName) => {
  if (!channelName) {
    throw new Error("Channel name is not provided");
  }

  const [channelChat] = await strapi.db.connection.raw(
    getChannelChatQuery(channelName)
  );

  return channelChat;
};

const createChatMessage = async (username, channelName, message) => {
  if (!username || !channelName || !message) {
    throw new Error("Missing required parameters to create a chat message.");
  }

  const UP_USER_TABLE = "plugin::users-permissions.user";
  const CHANNEL_TABLE = "api::chat.channel";
  const CHAT_TABLE = "api::chat.chat";

  const existingUser = await strapi.db.query(UP_USER_TABLE).findOne({
    where: { username },
  });

  if (!existingUser) {
    throw new Error(`User with username ${username} does not exist.`);
  }

  const existingChannel = await strapi.db.query(CHANNEL_TABLE).findOne({
    where: { name: channelName },
  });

  if (!existingChannel) {
    throw new Error(`Channel with name ${channelName} does not exist`);
  }

  await strapi.db.query(CHAT_TABLE).create({
    data: {
      channelName,
      message,
      senderId: existingUser.id,
    },
  });
};

const getChannelChatQuery = (channelName) => {
  return `
    SELECT
      c.channelName,
      c.message,
      u.username
    FROM chats AS c
    JOIN up_users AS u
    ON u.id = c.sender_id
    WHERE
      channel_name = '${channelName}'
    `;
};

module.exports = { getChannelChat, createChatMessage };
