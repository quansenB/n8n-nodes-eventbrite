import { IHookFunctions, IWebhookFunctions } from 'n8n-core';
import { ILoadOptionsFunctions, INodePropertyOptions, INodeType, INodeTypeDescription, IWebhookResponseData } from 'n8n-workflow';
export declare class EventbriteTrigger implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getOrganizations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getEvents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    webhookMethods: {
        default: {
            checkExists(this: IHookFunctions): Promise<boolean>;
            create(this: IHookFunctions): Promise<boolean>;
            delete(this: IHookFunctions): Promise<boolean>;
        };
    };
    webhook(this: IWebhookFunctions): Promise<IWebhookResponseData>;
}
