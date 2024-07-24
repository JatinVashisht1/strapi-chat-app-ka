const TAG = "controllers/chat.js";

const getChannelChat = async (ctx) => {
  try {
    const { channelName } = ctx.request.params;

    if (!channelName) {
      return ctx.badRequest("channelName is required field");
    }

    const CHANNEL_TABLE = "api::chat.channel";
    const existingChannel = await strapi.db.query(CHANNEL_TABLE).findOne({
      where: {
        name: channelName,
      },
    });

    if (!existingChannel) {
      return ctx.badRequest(`Invalid channel name. Provided ${channelName}`);
    }

    const channelChat = await strapi
      .service("api::chat.chat")
      .getChannelChat(channelName);

    return channelChat;
  } catch (error) {
    strapi.log.error(`${TAG}: error in retrieving channel chat, `, error);

    return ctx.internalServerError("Unable to get chat. Something went wrong.");
  }
};

const createChannel = async (ctx) => {
  try {
    const { channelName } = ctx.request.body;
    const CHANNEL_TABLE = "api::chat.channel";

    if (!channelName) {
      return ctx.badRequest("channelName is required field");
    }

    const existingChannel = await strapi.db.query(CHANNEL_TABLE).findOne({
      where: {
        name: channelName,
      },
    });

    if (existingChannel) {
      return ctx.badRequest(`Channel with name ${channelName} already exist.`);
    }

    await strapi.db.query(CHANNEL_TABLE).create({
      data: {
        name: channelName,
      },
    });

    return {
      success: true,
      message: "Channel created successfully.",
      metadata: {
        channelName: channelName,
      },
    };
  } catch (error) {
    strapi.log.error(`${TAG}: error in creating channel, `, error);

    return ctx.internalServerError(
      "Unable to create channel. Something went wrong."
    );
  }
};

const getChannelList = async (ctx) => {
  try {
    const CHANNEL_TABLE = "api::chat.channel";

    const channelList = await strapi.db.query(CHANNEL_TABLE).findMany({
      select: ["name"],
    });

    return channelList;
  } catch (error) {
    strapi.log.error(`${TAG}: Error while retrieving channel list, `, error);

    return ctx.internalServerError(
      "Unable to get channel list. Something went wrong"
    );
  }
};

module.exports = { getChannelChat, createChannel, getChannelList };
