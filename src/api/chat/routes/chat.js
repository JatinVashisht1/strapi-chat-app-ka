module.exports = {
  routes: [
    {
      method: "GET",
      path: "/chat/:channelId",
      handler: "chat.getChannelChat",
    },
    {
      method: "POST",
      path: "/chat/channel",
      handler: "chat.createChannel",
    },
    {
      method: "GET",
      path: "/chat/list/channel",
      handler: "chat.getChannelList",
    },
  ],
};
