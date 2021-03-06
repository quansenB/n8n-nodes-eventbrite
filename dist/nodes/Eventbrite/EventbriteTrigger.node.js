"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventbriteTrigger = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
class EventbriteTrigger {
    constructor() {
        this.description = {
            displayName: 'Eventbrite Trigger',
            name: 'eventbriteTrigger',
            icon: 'file:eventbrite.png',
            group: ['trigger'],
            version: 1,
            description: 'Handle Eventbrite events via webhooks',
            defaults: {
                name: 'Eventbrite Trigger',
                color: '#dc5237',
            },
            inputs: [],
            outputs: ['main'],
            credentials: [
                {
                    name: 'eventbriteApi',
                    required: true,
                    displayOptions: {
                        show: {
                            authentication: [
                                'privateKey',
                            ],
                        },
                    },
                },
                {
                    name: 'eventbriteOAuth2Api',
                    required: true,
                    displayOptions: {
                        show: {
                            authentication: [
                                'oAuth2',
                            ],
                        },
                    },
                },
            ],
            webhooks: [
                {
                    name: 'default',
                    httpMethod: 'POST',
                    responseMode: 'onReceived',
                    path: 'webhook',
                },
            ],
            properties: [
                {
                    displayName: 'Authentication',
                    name: 'authentication',
                    type: 'options',
                    options: [
                        {
                            name: 'Private Key',
                            value: 'privateKey',
                        },
                        {
                            name: 'OAuth2',
                            value: 'oAuth2',
                        },
                    ],
                    default: 'privateKey',
                    description: 'The resource to operate on.',
                },
                {
                    displayName: 'Organization',
                    name: 'organization',
                    type: 'options',
                    required: true,
                    typeOptions: {
                        loadOptionsMethod: 'getOrganizations',
                    },
                    default: '',
                    description: '',
                },
                {
                    displayName: 'Event',
                    name: 'event',
                    type: 'options',
                    required: true,
                    typeOptions: {
                        loadOptionsDependsOn: [
                            'organization',
                        ],
                        loadOptionsMethod: 'getEvents',
                    },
                    default: '',
                    description: '',
                },
                {
                    displayName: 'Actions',
                    name: 'actions',
                    type: 'multiOptions',
                    options: [
                        {
                            name: 'attendee.updated',
                            value: 'attendee.updated',
                        },
                        {
                            name: 'attendee.checked_in',
                            value: 'attendee.checked_in',
                        },
                        {
                            name: 'attendee.checked_out',
                            value: 'attendee.checked_out',
                        },
                        {
                            name: 'event.created',
                            value: 'event.created',
                        },
                        {
                            name: 'event.published',
                            value: 'event.published',
                        },
                        {
                            name: 'event.unpublished',
                            value: 'event.unpublished',
                        },
                        {
                            name: 'event.updated',
                            value: 'event.updated',
                        },
                        {
                            name: 'order.placed',
                            value: 'order.placed',
                        },
                        {
                            name: 'order.refunded',
                            value: 'order.refunded',
                        },
                        {
                            name: 'order.updated',
                            value: 'order.updated',
                        },
                        {
                            name: 'organizer.updated',
                            value: 'organizer.updated',
                        },
                        {
                            name: 'ticket_class.created',
                            value: 'ticket_class.created',
                        },
                        {
                            name: 'ticket_class.deleted',
                            value: 'ticket_class.deleted',
                        },
                        {
                            name: 'ticket_class.updated',
                            value: 'ticket_class.updated',
                        },
                        {
                            name: 'venue.updated',
                            value: 'venue.updated',
                        },
                    ],
                    required: true,
                    default: [],
                    description: '',
                },
                {
                    displayName: 'Resolve Data',
                    name: 'resolveData',
                    type: 'boolean',
                    default: true,
                    description: 'By default does the webhook-data only contain the URL to receive<br />the object data manually. If this option gets activated it<br />will resolve the data automatically.',
                },
            ],
        };
        this.methods = {
            loadOptions: {
                async getOrganizations() {
                    const returnData = [];
                    const organizations = await GenericFunctions_1.eventbriteApiRequestAllItems.call(this, 'organizations', 'GET', '/users/me/organizations');
                    for (const organization of organizations) {
                        const organizationName = organization.name;
                        const organizationId = organization.id;
                        returnData.push({
                            name: organizationName,
                            value: organizationId,
                        });
                    }
                    return returnData;
                },
                async getEvents() {
                    const returnData = [];
                    const organization = this.getCurrentNodeParameter('organization');
                    const events = await GenericFunctions_1.eventbriteApiRequestAllItems.call(this, 'events', 'GET', `/organizations/${organization}/events`);
                    for (const event of events) {
                        const eventName = event.name.text;
                        const eventId = event.id;
                        returnData.push({
                            name: eventName,
                            value: eventId,
                        });
                    }
                    return returnData;
                },
            },
        };
        this.webhookMethods = {
            default: {
                async checkExists() {
                    const webhookData = this.getWorkflowStaticData('node');
                    const webhookUrl = this.getNodeWebhookUrl('default');
                    const organisation = this.getNodeParameter('organization');
                    const actions = this.getNodeParameter('actions');
                    const endpoint = `/organizations/${organisation}/webhooks/`;
                    const { webhooks } = await GenericFunctions_1.eventbriteApiRequest.call(this, 'GET', endpoint);
                    const check = (currentActions, webhookActions) => {
                        for (const currentAction of currentActions) {
                            if (!webhookActions.includes(currentAction)) {
                                return false;
                            }
                        }
                        return true;
                    };
                    for (const webhook of webhooks) {
                        if (webhook.endpoint_url === webhookUrl && check(actions, webhook.actions)) {
                            webhookData.webhookId = webhook.id;
                            return true;
                        }
                    }
                    return false;
                },
                async create() {
                    const webhookUrl = this.getNodeWebhookUrl('default');
                    const webhookData = this.getWorkflowStaticData('node');
                    const organisation = this.getNodeParameter('organization');
                    const event = this.getNodeParameter('event');
                    const actions = this.getNodeParameter('actions');
                    const endpoint = `/organizations/${organisation}/webhooks/`;
                    const body = {
                        endpoint_url: webhookUrl,
                        actions: actions.join(','),
                        event_id: event,
                    };
                    const responseData = await GenericFunctions_1.eventbriteApiRequest.call(this, 'POST', endpoint, body);
                    webhookData.webhookId = responseData.id;
                    return true;
                },
                async delete() {
                    let responseData;
                    const webhookData = this.getWorkflowStaticData('node');
                    const endpoint = `/webhooks/${webhookData.webhookId}/`;
                    try {
                        responseData = await GenericFunctions_1.eventbriteApiRequest.call(this, 'DELETE', endpoint);
                    }
                    catch (error) {
                        return false;
                    }
                    if (!responseData.success) {
                        return false;
                    }
                    delete webhookData.webhookId;
                    return true;
                },
            },
        };
    }
    async webhook() {
        const req = this.getRequestObject();
        if (req.body.api_url === undefined) {
            throw new n8n_workflow_1.NodeApiError(this.getNode(), req.body, { message: 'The received data does not contain required "api_url" property!' });
        }
        const resolveData = this.getNodeParameter('resolveData', false);
        if (resolveData === false) {
            return {
                workflowData: [
                    this.helpers.returnJsonArray(req.body),
                ],
            };
        }
        if (req.body.api_url.includes('api-endpoint-to-fetch-object-details')) {
            return {
                workflowData: [
                    this.helpers.returnJsonArray({
                        placeholder: 'Test received. To display actual data of object get the webhook triggered by performing the action which triggers it.',
                    }),
                ],
            };
        }
        const responseData = await GenericFunctions_1.eventbriteApiRequest.call(this, 'GET', '', {}, undefined, req.body.api_url);
        return {
            workflowData: [
                this.helpers.returnJsonArray(responseData),
            ],
        };
    }
}
exports.EventbriteTrigger = EventbriteTrigger;
//# sourceMappingURL=EventbriteTrigger.node.js.map