import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core';
import Oas from 'oas';
import APICore from 'api/dist/core';
declare class SDK {
    spec: Oas;
    core: APICore;
    constructor();
    /**
     * Optionally configure various options that the SDK allows.
     *
     * @param config Object of supported SDK options and toggles.
     * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
     * should be represented in milliseconds.
     */
    config(config: ConfigOptions): void;
    /**
     * If the API you're using requires authentication you can supply the required credentials
     * through this method and the library will magically determine how they should be used
     * within your API request.
     *
     * With the exception of OpenID and MutualTLS, it supports all forms of authentication
     * supported by the OpenAPI specification.
     *
     * @example <caption>HTTP Basic auth</caption>
     * sdk.auth('username', 'password');
     *
     * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
     * sdk.auth('myBearerToken');
     *
     * @example <caption>API Keys</caption>
     * sdk.auth('myApiKey');
     *
     * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
     * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
     * @param values Your auth credentials for the API; can specify up to two strings or numbers.
     */
    auth(...values: string[] | number[]): this;
    /**
     * If the API you're using offers alternate server URLs, and server variables, you can tell
     * the SDK which one to use with this method. To use it you can supply either one of the
     * server URLs that are contained within the OpenAPI definition (along with any server
     * variables), or you can pass it a fully qualified URL to use (that may or may not exist
     * within the OpenAPI definition).
     *
     * @example <caption>Server URL with server variables</caption>
     * sdk.server('https://{region}.api.example.com/{basePath}', {
     *   name: 'eu',
     *   basePath: 'v14',
     * });
     *
     * @example <caption>Fully qualified server URL</caption>
     * sdk.server('https://eu.api.example.com/v14');
     *
     * @param url Server URL
     * @param variables An object of variables to replace into the server URL.
     */
    server(url: string, variables?: {}): void;
    /**
     * Retrieve a list of your instances.
     *
     * @summary list instances
     */
    listInstances(metadata?: types.ListInstancesMetadataParam): Promise<FetchResponse<200, types.ListInstancesResponse200>>;
    /**
     * Create a new instance
     *
     * @summary create instance
     */
    createInstance(): Promise<FetchResponse<200, types.CreateInstanceResponse200>>;
    /**
     * Retrieve a single instance by its ID
     *
     * @summary retrieve instance
     */
    retrieveInstance(metadata: types.RetrieveInstanceMetadataParam): Promise<FetchResponse<200, types.RetrieveInstanceResponse200>>;
    /**
     * Update the instance.
     *
     * @summary update instance
     */
    updateInstance(body: types.UpdateInstanceBodyParam, metadata: types.UpdateInstanceMetadataParam): Promise<FetchResponse<200, types.UpdateInstanceResponse200>>;
    /**
     * delete an instance by ID
     *
     * @summary delete instance
     */
    deleteInstance(metadata: types.DeleteInstanceMetadataParam): Promise<FetchResponse<number, unknown>>;
    /**
     * retrieve the status of your running client
     *
     * @summary client status of instance
     */
    clientStatusOfInstance(metadata: types.ClientStatusOfInstanceMetadataParam): Promise<FetchResponse<200, types.ClientStatusOfInstanceResponse200>>;
    /**
     * Retrieves a base64 encoded QR code image that can be used to authenticate and connect a
     * account to this instance.
     *
     * @summary retrieve QR Code
     */
    retrieveQrCode(metadata: types.RetrieveQrCodeMetadataParam): Promise<FetchResponse<200, types.RetrieveQrCodeResponse200>>;
    /**
     * retrieve general information of the user conntected to your instance
     *
     * @summary retrieve basic client information
     */
    retrieveBasicClientInformation(metadata: types.RetrieveBasicClientInformationMetadataParam): Promise<FetchResponse<200, types.RetrieveBasicClientInformationResponse200>>;
    /**
     * Send a text message to a chat. The chatId format varies depending on the chat type:
     * - Individual chat: {phone_number}@c.us (e.g. 50664083362@c.us)
     * - Group chat: {group_id}@g.us (e.g. 123456789-123456789@g.us)
     * - Channel/Newsletter: {channel_id}@newsletter (e.g. 123456789@newsletter)
     *
     * @summary Send a text message to a chat
     */
    sendTextMessageToChat(body: types.SendTextMessageToChatBodyParam, metadata: types.SendTextMessageToChatMetadataParam): Promise<FetchResponse<200, types.SendTextMessageToChatResponse200>>;
    /**
     * Send a media message (image, video, audio, document) to a chat. The chatId format varies
     * depending on the chat type:
     * - Individual chat: {phone_number}@c.us (e.g. 123456789@c.us)
     * - Group chat: {group_id}@g.us (e.g. 123456789-123456789@g.us)
     * - Channel/Newsletter: {channel_id}@newsletter (e.g. 123456789@newsletter)
     *
     * Supported media types:
     * - Images: jpg, jpeg, png, gif
     * - Videos: mp4, 3gp, mov
     * - Audio: mp3, wav, ogg, m4a
     * - Documents: pdf, doc, docx, txt, xlsx, etc
     *
     * @summary Send a media message (image, video, audio, document)
     */
    sendMediaMessage(body: types.SendMediaMessageBodyParam, metadata: types.SendMediaMessageMetadataParam): Promise<FetchResponse<200, types.SendMediaMessageResponse200>>;
    /**
     * Mark all messages in a chat as seen (read). This will show blue ticks (double check
     * marks) to the sender only if both parties have read receipts enabled in their privacy
     * settings. If read receipts are disabled by either party, the messages will be marked as
     * delivered (gray ticks) instead.
     *
     * @summary Mark chat messages as seen (blue ticks)
     */
    sendSeen(body: types.SendSeenBodyParam, metadata: types.SendSeenMetadataParam): Promise<FetchResponse<200, types.SendSeenResponse200>>;
    /**
     * Send a vCard to a contact or group.
     *
     * @summary Send vCard
     */
    sendVcard(body: types.SendVcardBodyParam, metadata: types.SendVcardMetadataParam): Promise<FetchResponse<200, types.SendVcardResponse200>>;
    /**
     * Send a location message to a contact or group chat. The location can include additional
     * details like name, address and URL.
     *
     * @summary Send Location
     */
    sendLocation(body: types.SendLocationBodyParam, metadata: types.SendLocationMetadataParam): Promise<FetchResponse<200, types.SendLocationResponse200>>;
    /**
     * Retrieves a list of all chats with their latest messages and metadata. Supports
     * pagination.
     *
     * @summary Get all chats
     */
    getChats(body: types.GetChatsBodyParam, metadata: types.GetChatsMetadataParam): Promise<FetchResponse<200, types.GetChatsResponse200>>;
    /**
     * Marks a specified chat conversation as unread. This is useful for flagging important
     * conversations for later attention.
     *
     * @summary Mark Chat as Unread
     */
    markChatUnread(body: types.MarkChatUnreadBodyParam, metadata: types.MarkChatUnreadMetadataParam): Promise<FetchResponse<200, types.MarkChatUnreadResponse200>>;
    /**
     * Mute notifications for a specific chat either indefinitely or until a specified date
     *
     * @summary Mute Chat
     */
    muteChat(body: types.MuteChatBodyParam, metadata: types.MuteChatMetadataParam): Promise<FetchResponse<200, types.MuteChatResponse200>>;
    /**
     * Removes mute settings from a specified chat, allowing notifications to be received
     * again.
     *
     * @summary Unmute Chat
     */
    unmuteChat(body: types.UnmuteChatBodyParam, metadata: types.UnmuteChatMetadataParam): Promise<FetchResponse<200, types.UnmuteChatResponse200>>;
    /**
     * Pins a chat to the top of the chat list. The operation may fail if the maximum number of
     * pinned chats (3) has been reached.
     *
     * @summary Pin Chat
     */
    pinChat(body: types.PinChatBodyParam, metadata: types.PinChatMetadataParam): Promise<FetchResponse<200, types.PinChatResponse200>>;
    /**
     * Removes a chat from pinned status. This endpoint allows you to unpin a previously pinned
     * chat conversation.
     *
     * @summary Unpin Chat
     */
    unpinChat(body: types.UnpinChatBodyParam, metadata: types.UnpinChatMetadataParam): Promise<FetchResponse<200, types.UnpinChatResponse200>>;
    /**
     * Retrieve messages from a specific chat with optional filtering and media inclusion
     *
     * @summary Fetch messages from a chat
     */
    fetchMessages(body: types.FetchMessagesBodyParam, metadata: types.FetchMessagesMetadataParam): Promise<FetchResponse<200, types.FetchMessagesResponse200>>;
    /**
     * Retrieve a specific message using its unique identifier. Optionally includes the media
     * content if requested.
     *
     * @summary Get Message by ID
     */
    getMessageById(body: types.GetMessageByIdBodyParam, metadata: types.GetMessageByIdMetadataParam): Promise<FetchResponse<200, types.GetMessageByIdResponse200>>;
    /**
     * get a message info by id
     *
     * @summary get message info by id
     */
    getMessageInfoById(body: types.GetMessageInfoByIdBodyParam, metadata: types.GetMessageInfoByIdMetadataParam): Promise<FetchResponse<200, types.GetMessageInfoByIdResponse200>>;
    /**
     * delete a message by id
     *
     * @summary delete message by id
     */
    deleteMessageById(body: types.DeleteMessageByIdBodyParam, metadata: types.DeleteMessageByIdMetadataParam): Promise<FetchResponse<200, types.DeleteMessageByIdResponse200>>;
    /**
     * Search for messages across all chats or within a specific chat. Returns paginated
     * results with message details.
     *
     * @summary Search Messages
     */
    searchMessages(body: types.SearchMessagesBodyParam, metadata: types.SearchMessagesMetadataParam): Promise<FetchResponse<200, types.SearchMessagesResponse200>>;
    /**
     * Retrieves a list of all contacts from the  account, including saved contacts and  users
     * who have messaged you.
     *
     * @summary Get all contacts
     */
    getContacts(metadata: types.GetContactsMetadataParam): Promise<FetchResponse<200, types.GetContactsResponse200>>;
    /**
     * Converts a phone number into the proper chat ID format. This is especially useful for
     * countries that don't follow the standard chat ID format (like Brazil, Mexico and
     * Argentina). The endpoint ensures you get the correct chat ID for any phone number.
     *
     * @summary Get chat ID from phone number
     */
    getNumberId(body: types.GetNumberIdBodyParam, metadata: types.GetNumberIdMetadataParam): Promise<FetchResponse<200, types.GetNumberIdResponse200>>;
    /**
     * Get the country code for a given phone number
     *
     * @summary get country code
     */
    getCountryCode(body: types.GetCountryCodeBodyParam, metadata: types.GetCountryCodeMetadataParam): Promise<FetchResponse<200, types.GetCountryCodeResponse200>>;
    /**
     * Format a phone number into standardized format
     *
     * @summary get formatted number
     */
    getFormattedNumber(body: types.GetFormattedNumberBodyParam, metadata: types.GetFormattedNumberMetadataParam): Promise<FetchResponse<200, types.GetFormattedNumberResponse200>>;
    /**
     * Check if a given contactId is registered.
     *
     * @summary is registered user
     */
    isRegisteredUser(body: types.IsRegisteredUserBodyParam, metadata: types.IsRegisteredUserMetadataParam): Promise<FetchResponse<200, types.IsRegisteredUserResponse200>>;
    /**
     * Creates and sends an interactive poll message to a specified chat. The poll can have
     * between 2-12 options and optionally allow multiple selections.
     *
     * @summary Create Poll Message
     */
    createPoll(body: types.CreatePollBodyParam, metadata: types.CreatePollMetadataParam): Promise<FetchResponse<200, types.CreatePollResponse200>>;
    /**
     * Retrieves all available stories/status updates that are visible to the authenticated
     * user. This includes both viewed and unviewed stories from contacts.
     *
     * @summary Get Stories
     */
    getStories(metadata: types.GetStoriesMetadataParam): Promise<FetchResponse<200, types.GetStoriesResponse200>>;
    /**
     * Retrieves the profile picture URL for a contact, chat, group, or newsletter. Access is
     * subject to privacy settings. Use appropriate suffixes: @c.us for contacts/chats, @g.us
     * for groups, @newsletter for newsletters.
     *
     * @summary Get Profile Picture URL
     */
    getProfilePicUrl(body: types.GetProfilePicUrlBodyParam, metadata: types.GetProfilePicUrlMetadataParam): Promise<FetchResponse<200, types.GetProfilePicUrlResponse200>>;
    /**
     * Retrieves detailed contact information for a specific contact using their ID. Returns
     * contact details including name, number, business status, and various contact flags.
     *
     * @summary Get Contact Details by ID
     */
    getContactById(body: types.GetContactByIdBodyParam, metadata: types.GetContactByIdMetadataParam): Promise<FetchResponse<200, types.GetContactByIdResponse200>>;
    /**
     * Creates a new contact or updates an existing one in the address book. The contact will
     * be synchronized to the device's address book if syncToAddressbook is true.
     *
     * @summary Add and Update Contact
     */
    upsertContact(body: types.UpsertContactBodyParam, metadata: types.UpsertContactMetadataParam): Promise<FetchResponse<200, types.UpsertContactResponse200>>;
    /**
     * Deletes a contact from the address book.
     *
     * @summary Delete Contact
     */
    deleteContact(body: types.DeleteContactBodyParam, metadata: types.DeleteContactMetadataParam): Promise<FetchResponse<200, types.DeleteContactResponse200>>;
    /**
     * Blocks a contact, preventing them from sending messages to the authenticated user. The
     * contact will not be able to see the user's last seen, online status, or status updates.
     *
     * @summary Block a Contact
     */
    blockContact(body: types.BlockContactBodyParam, metadata: types.BlockContactMetadataParam): Promise<FetchResponse<200, types.BlockContactResponse200>>;
    /**
     * Removes a contact from the blocked contacts list, allowing them to send messages and see
     * your information again according to your privacy settings.
     *
     * @summary Unblock a Contact
     */
    unblockContact(body: types.UnblockContactBodyParam, metadata: types.UnblockContactMetadataParam): Promise<FetchResponse<200, types.UnblockContactResponse200>>;
    /**
     * Retrieves a list of all blocked contacts
     *
     * @summary Get blocked contacts
     */
    getBlockedContacts(metadata: types.GetBlockedContactsMetadataParam): Promise<FetchResponse<200, types.GetBlockedContactsResponse200>>;
    /**
     * Get list of groups that are in common between you and the specified contact
     *
     * @summary Get common groups with contact
     */
    getCommonGroups(body: types.GetCommonGroupsBodyParam, metadata: types.GetCommonGroupsMetadataParam): Promise<FetchResponse<200, types.GetCommonGroupsResponse200>>;
    /**
     * Retrieves the about/status info for a specific contact
     *
     * @summary Get contact about info
     */
    getContactAboutInfo(body: types.GetContactAboutInfoBodyParam, metadata: types.GetContactAboutInfoMetadataParam): Promise<FetchResponse<200, types.GetContactAboutInfoResponse200>>;
    /**
     * Get chat by ID
     *
     * @summary get chat by id
     */
    getChatById(body: types.GetChatByIdBodyParam, metadata: types.GetChatByIdMetadataParam): Promise<FetchResponse<200, types.GetChatByIdResponse200>>;
    /**
     * Delete chat by ID
     *
     * @summary delete chat by id
     */
    deleteChatById(body: types.DeleteChatByIdBodyParam, metadata: types.DeleteChatByIdMetadataParam): Promise<FetchResponse<200, types.DeleteChatByIdResponse200>>;
    /**
     * Creates a new group with specified name and participants
     *
     * @summary Create Group
     */
    createGroup(body: types.CreateGroupBodyParam, metadata: types.CreateGroupMetadataParam): Promise<FetchResponse<200, types.CreateGroupResponse200>>;
    /**
     * Get group participants
     *
     * @summary get group participants
     */
    getGroupParticipants(body: types.GetGroupParticipantsBodyParam, metadata: types.GetGroupParticipantsMetadataParam): Promise<FetchResponse<200, types.GetGroupParticipantsResponse200>>;
    /**
     * Get group info
     *
     * @summary get group info
     */
    getGroupInfo(body: types.GetGroupInfoBodyParam, metadata: types.GetGroupInfoMetadataParam): Promise<FetchResponse<200, types.GetGroupInfoResponse200>>;
    /**
     * Get reactions for a specific message
     *
     * @summary get message reactions
     */
    getReactions(body: types.GetReactionsBodyParam, metadata: types.GetReactionsMetadataParam): Promise<FetchResponse<200, types.GetReactionsResponse200>>;
    /**
     * Add or remove a reaction emoji to/from a message
     *
     * @summary react to message
     */
    reactToMessage(body: types.ReactToMessageBodyParam, metadata: types.ReactToMessageMetadataParam): Promise<FetchResponse<200, types.ReactToMessageResponse200>>;
    /**
     * Update Group Information
     *
     * @summary update group info
     */
    updateGroupInfo(body: types.UpdateGroupInfoBodyParam, metadata: types.UpdateGroupInfoMetadataParam): Promise<FetchResponse<200, types.UpdateGroupInfoResponse200>>;
    /**
     * Get mentions from a message
     *
     * @summary get message mentions
     */
    getMessageMentions(body: types.GetMessageMentionsBodyParam, metadata: types.GetMessageMentionsMetadataParam): Promise<FetchResponse<200, types.GetMessageMentionsResponse200>>;
    /**
     * Pin a message in a chat
     *
     * @summary pin message
     */
    pinMessage(body: types.PinMessageBodyParam, metadata: types.PinMessageMetadataParam): Promise<FetchResponse<200, types.PinMessageResponse200>>;
    /**
     * Unpin a message in a chat
     *
     * @summary unpin message
     */
    unpinMessage(body: types.UnpinMessageBodyParam, metadata: types.UnpinMessageMetadataParam): Promise<FetchResponse<200, types.UnpinMessageResponse200>>;
    /**
     * Star a message by its ID
     *
     * @summary star message
     */
    starMessage(body: types.StarMessageBodyParam, metadata: types.StarMessageMetadataParam): Promise<FetchResponse<200, types.StarMessageResponse200>>;
    /**
     * Remove star from a message
     *
     * @summary unstar message
     */
    unstarMessage(body: types.UnstarMessageBodyParam, metadata: types.UnstarMessageMetadataParam): Promise<FetchResponse<200, types.UnstarMessageResponse200>>;
    /**
     * Update Group Settings
     *
     * @summary update group settings
     */
    updateGroupSettings(body: types.UpdateGroupSettingsBodyParam, metadata: types.UpdateGroupSettingsMetadataParam): Promise<FetchResponse<200, types.UpdateGroupSettingsResponse200>>;
    /**
     * Add a participant to a group
     *
     * @summary add group participant
     */
    addGroupParticipant(body: types.AddGroupParticipantBodyParam, metadata: types.AddGroupParticipantMetadataParam): Promise<FetchResponse<200, types.AddGroupParticipantResponse200>>;
    /**
     * Remove a participant from a group
     *
     * @summary remove group participant
     */
    removeGroupParticipant(body: types.RemoveGroupParticipantBodyParam, metadata: types.RemoveGroupParticipantMetadataParam): Promise<FetchResponse<200, types.RemoveGroupParticipantResponse200>>;
    /**
     * Promote a participant to admin
     *
     * @summary promote group participant
     */
    promoteGroupParticipant(body: types.PromoteGroupParticipantBodyParam, metadata: types.PromoteGroupParticipantMetadataParam): Promise<FetchResponse<200, types.PromoteGroupParticipantResponse200>>;
    /**
     * Demote a participant from admin to normal participant
     *
     * @summary demote group participant
     */
    demoteGroupParticipant(body: types.DemoteGroupParticipantBodyParam, metadata: types.DemoteGroupParticipantMetadataParam): Promise<FetchResponse<200, types.DemoteGroupParticipantResponse200>>;
    /**
     * Approve pending group membership requests
     *
     * @summary approve group membership requests
     */
    acceptGroupMemberRequests(body: types.AcceptGroupMemberRequestsBodyParam, metadata: types.AcceptGroupMemberRequestsMetadataParam): Promise<FetchResponse<200, types.AcceptGroupMemberRequestsResponse200>>;
    /**
     * Deny pending group membership requests
     *
     * @summary deny group membership requests
     */
    denyGroupMemberRequests(body: types.DenyGroupMemberRequestsBodyParam, metadata: types.DenyGroupMemberRequestsMetadataParam): Promise<FetchResponse<200, types.DenyGroupMemberRequestsResponse200>>;
    /**
     * Get pending group membership requests
     *
     * @summary get group membership requests
     */
    getGroupMemberRequests(body: types.GetGroupMemberRequestsBodyParam, metadata: types.GetGroupMemberRequestsMetadataParam): Promise<FetchResponse<200, types.GetGroupMemberRequestsResponse200>>;
    /**
     * Accept a group invite using an invite code
     *
     * @summary accept group invite
     */
    acceptInvite(body: types.AcceptInviteBodyParam, metadata: types.AcceptInviteMetadataParam): Promise<FetchResponse<200, types.AcceptInviteResponse200>>;
    /**
     * Get information about a group invite code
     *
     * @summary get group invite info
     */
    getInviteInfo(body: types.GetInviteInfoBodyParam, metadata: types.GetInviteInfoMetadataParam): Promise<FetchResponse<200, types.GetInviteInfoResponse200>>;
    /**
     * Create a channel
     *
     * @summary create a channel
     */
    createChannel(body: types.CreateChannelBodyParam, metadata: types.CreateChannelMetadataParam): Promise<FetchResponse<200, types.CreateChannelResponse200>>;
    /**
     * get your channels
     *
     * @summary get channels
     */
    getChannels(metadata: types.GetChannelsMetadataParam): Promise<FetchResponse<200, types.GetChannelsResponse200>>;
    /**
     * get channel by id
     *
     * @summary get channel by id
     */
    getChannelById(body: types.GetChannelByIdBodyParam, metadata: types.GetChannelByIdMetadataParam): Promise<FetchResponse<200, types.GetChannelByIdResponse200>>;
    /**
     * subscribe to channel
     *
     * @summary subscribe to channel
     */
    subscribeToChannel(body: types.SubscribeToChannelBodyParam, metadata: types.SubscribeToChannelMetadataParam): Promise<FetchResponse<200, types.SubscribeToChannelResponse200>>;
    /**
     * unsubscribe from channel
     *
     * @summary unsubscribe from channel
     */
    unsubscribeFromChannel(body: types.UnsubscribeFromChannelBodyParam, metadata: types.UnsubscribeFromChannelMetadataParam): Promise<FetchResponse<200, types.UnsubscribeFromChannelResponse200>>;
    /**
     * Search for channels
     *
     * @summary search channels
     */
    searchChannels(body: types.SearchChannelsBodyParam, metadata: types.SearchChannelsMetadataParam): Promise<FetchResponse<200, types.SearchChannelsResponse200>>;
    /**
     * archive chat
     *
     * @summary archive chat
     */
    archiveChat(body: types.ArchiveChatBodyParam, metadata: types.ArchiveChatMetadataParam): Promise<FetchResponse<200, types.ArchiveChatResponse200>>;
    /**
     * unarchive chat
     *
     * @summary unarchive chat
     */
    unarchiveChat(body: types.UnarchiveChatBodyParam, metadata: types.UnarchiveChatMetadataParam): Promise<FetchResponse<200, types.UnarchiveChatResponse200>>;
    /**
     * get all labels
     *
     */
    getLabels(metadata: types.GetLabelsMetadataParam): Promise<FetchResponse<200, types.GetLabelsResponse200>>;
    /**
     * Get label by ID
     *
     * @summary get label by id
     */
    getLabelById(body: types.GetLabelByIdBodyParam, metadata: types.GetLabelByIdMetadataParam): Promise<FetchResponse<200, types.GetLabelByIdResponse200>>;
    /**
     * Get chat labels by chat ID
     *
     * @summary get chat labels
     */
    getChatLabels(body: types.GetChatLabelsBodyParam, metadata: types.GetChatLabelsMetadataParam): Promise<FetchResponse<200, types.GetChatLabelsResponse200>>;
    /**
     * Get chats by label ID
     *
     * @summary get chats by labelId
     */
    getChatsByLabelId(body: types.GetChatsByLabelIdBodyParam, metadata: types.GetChatsByLabelIdMetadataParam): Promise<FetchResponse<200, types.GetChatsByLabelIdResponse200>>;
    /**
     * Logs out the client, closing the current session
     *
     * @summary logout
     */
    logout(metadata: types.LogoutMetadataParam): Promise<FetchResponse<200, types.LogoutResponse200>>;
    /**
     * Reboots your instance. This will close the current session and restart the client. The
     * instance will need to be re-authenticated if it was previously logged in.
     *
     * @summary Reboot Instance
     */
    reboot(metadata: types.RebootMetadataParam): Promise<FetchResponse<200, types.RebootResponse200>>;
    /**
     * Sets the client's presence status to 'available'/'online'
     *
     * @summary Send presence available
     */
    sendPresenceAvailable(metadata: types.SendPresenceAvailableMetadataParam): Promise<FetchResponse<200, types.SendPresenceAvailableResponse200>>;
    /**
     * Sets the status text for the connected account
     *
     * @summary Set status
     */
    setStatus(body: types.SetStatusBodyParam, metadata: types.SetStatusMetadataParam): Promise<FetchResponse<200, types.SetStatusResponse200>>;
    /**
     * Sets the display name for the account
     *
     * @summary Set display name
     */
    setDisplayName(body: types.SetDisplayNameBodyParam, metadata: types.SetDisplayNameMetadataParam): Promise<FetchResponse<200, types.SetDisplayNameResponse200>>;
    /**
     * Request a pairing code for phone number registration. To prevent abuse and ensure system
     * stability, pairing code requests are limited to 2 per minute. Multiple rapid requests
     * may indicate automated abuse attempts.
     *
     * @summary Request Pairing Code
     */
    requestPairingCode(body: types.RequestPairingCodeBodyParam, metadata: types.RequestPairingCodeMetadataParam): Promise<FetchResponse<200, types.RequestPairingCodeResponse200>>;
    /**
     * Sends typing state indicator to a chat
     *
     * @summary Send typing state
     */
    sendTyping(body: types.SendTypingBodyParam, metadata: types.SendTypingMetadataParam): Promise<FetchResponse<200, types.SendTypingResponse200>>;
    /**
     * Clears all messages from a specific chat
     *
     * @summary Clear chat messages
     */
    clearChatMessages(body: types.ClearChatMessagesBodyParam, metadata: types.ClearChatMessagesMetadataParam): Promise<FetchResponse<200, types.ClearChatMessagesResponse200>>;
    /**
     * Synchronizes the chat history for a specific chat
     *
     * @summary Sync chat history
     */
    syncChatHistory(body: types.SyncChatHistoryBodyParam, metadata: types.SyncChatHistoryMetadataParam): Promise<FetchResponse<200, types.SyncChatHistoryResponse200>>;
    /**
     * Stops the typing indicator for a chat
     *
     * @summary Stop typing indicator
     */
    sendStopTyping(body: types.SendStopTypingBodyParam, metadata: types.SendStopTypingMetadataParam): Promise<FetchResponse<200, types.SendStopTypingResponse200>>;
    /**
     * Sets the client's presence status to 'unavailable'/'offline'
     *
     * @summary Send presence unavailable
     */
    sendPresenceUnavailable(metadata: types.SendPresenceUnavailableMetadataParam): Promise<FetchResponse<200, types.SendPresenceUnavailableResponse200>>;
}
declare const createSDK: SDK;
export = createSDK;
