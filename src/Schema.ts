import { Model, ModelMethodParams } from "./Model";

export enum SchemaType {
    string = 'string',
    number = 'number',
    array = 'object',
    object = 'object'
}

export interface SchemaInitOptions {
    [name: string]: SchemaField;
}

export interface SchemaFieldInitOptions {
    type: SchemaType;
    max?: number;
    min?: number;
    maxLen?: number;
    minLen?: number;
    default?: any;
    required?: boolean;
    unique?: boolean;
}

export class Schema {
    public readonly schema: SchemaInitOptions;

    constructor (schemaTemp: SchemaInitOptions) {
        let schema: SchemaInitOptions = {};
        for (const key of Object.keys(schemaTemp)) {
            schema[key] = new SchemaField(schemaTemp[key]);
        }

        this.schema = schema;
    }

    checkByScheme (data: ModelMethodParams, model: Model) {
        const schema = this.schema;

        for (const key of Object.keys(data)) {
            if (schema[key] && schema[key].required && !data[key]) {
                throw new Error(`undefined required field ${key}`);
            }

            if (!schema[key]){
                throw new Error(`unknow field ${key} got; schema doesnt contains this field`)
            }

            if (schema[key] && typeof data[key] != schema[key].type) {
                throw new Error(`value of ${key} doesnt correspond to type ${schema[key].type}; received value: ${data[key]}`);
            }

            if (typeof data[key] == SchemaType.number) {
                if (schema[key].max && data[key] > schema[key].max!) {
                    throw new Error(`received value more than max value; max value is ${schema[key].max}`);
                }

                if (schema[key].min && data[key] < schema[key].min!) {
                    throw new Error(`received value less than min value; min value is ${schema[key].min}`);
                }
            }

            if (typeof data[key] == SchemaType.string || typeof data[key] == SchemaType.array) {
                if (schema[key].maxLen && data[key].length > schema[key].maxLen!) {
                    throw new Error(`received value length more than max length; max length is ${schema[key].maxLen}`);
                }

                if (schema[key].minLen && data[key].length < schema[key].minLen!) {
                    throw new Error(`received value length less than min length; min length is ${schema[key].minLen}`);
                }
            }

            if (schema[key].unique) {
                const gotDoc = model.get({[key]: data[key]})[0] || null;

                if (!gotDoc) return;

                for (const field of Object.keys(gotDoc)) {
                    if (gotDoc[field] == data[field]) {
                        throw new Error(`${field} is unique field, but to write got exist value;`)
                    }
                }
            }
        }
    }
}

export class SchemaField {
    public readonly type: SchemaType;
    public readonly max?: number
    public readonly min?: number
    public readonly maxLen?: number
    public readonly minLen?: number
    public readonly default?: any
    public readonly required?: boolean = false;
    public readonly unique?: boolean = false;

    constructor (field: SchemaFieldInitOptions) {
        if (!Object.values(SchemaType).includes(field.type)) {
            throw new Error(`invalid type, expected ${Object.keys(SchemaField).join(", ")}, received ${field.type}`);
        }

        if (field.type == SchemaType.string || field.type == SchemaType.array) {
            if (field.maxLen && field.maxLen < 0) {
                throw new Error(`max len less than zero`);
            }

            if (field.minLen && field.minLen < 0) {
                throw new Error(`min len less than zero`);
            }

            if (field.maxLen && field.minLen && field.minLen > field.maxLen) {
                throw new Error(`max len less than min len`);
            }

            
            this.maxLen = field.maxLen || Number.MAX_SAFE_INTEGER;
            this.minLen = field.minLen || 0;     
        }

        if (field.type == SchemaType.number) {
            if (field.max && field.max < 0) {
                throw new Error(`max value less than zero`);
            }

            if (field.min && field.min < 0) {
                throw new Error(`min value less than zero`);
            }

            if (field.max && field.min && field.max < field.min) {
                throw new Error(`max value less than min value`);
            }

            this.max = field.max || Number.MAX_SAFE_INTEGER;
            this.min = field.min || Number.MIN_SAFE_INTEGER;
        }

        this.type = field.type;
        
        if (field.default && !field.required && !field.unique) {
            this.default = field.default;
        }

        if (field.required != null) {
            this.required = field.required;
        }

        if (field.unique != null) {
            this.unique = field.unique;
        }
    }
}