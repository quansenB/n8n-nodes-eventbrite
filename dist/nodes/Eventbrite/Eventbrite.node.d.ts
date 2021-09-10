import { IExecuteFunctions } from 'n8n-core';
import { ILoadOptionsFunctions, INodeExecutionData, INodePropertyOptions, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class Eventbrite implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getOrganizations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getEvents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
