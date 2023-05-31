import { SchemaInitOptions } from "./Schema";
import { Schema } from "./Schema";
import { Model, ModelData } from "./Model";

import { isDeepStrictEqual } from "node:util";
import path from "node:path";
import fs from "node:fs";

export interface FileSystemInitOptions {
    dbPath: string;
}

export interface ModelRawData {
    name: string,
    path: string,
    schema: SchemaInitOptions,
    data: Array<{[name: string]: any}>
}

export class FileSystem {
    private readonly dbPath: string;

    constructor ({ dbPath }: FileSystemInitOptions) {
        this.dbPath = dbPath;
    }

    createDatabaseFolder (): void {
        const existFolder = fs.existsSync(this.dbPath);

        if (!existFolder) {
            return fs.mkdirSync(this.dbPath);
        }
    }

    createDatabaseModel (model: Model): void {
        const modelPath = path.join(this.dbPath, model.name);
        const modelExist = fs.existsSync(modelPath);

        const modelParams: ModelRawData = {
            name: model.name,
            path: modelPath,
            schema: model.schema.schema,
            data: []
        }

        if (!modelExist) {
            return fs.appendFileSync(modelPath, JSON.stringify(modelParams));
        }
    }

    readModelData (modelName: string): ModelRawData {
        const modelPath = path.join(this.dbPath, modelName);
        const modelExist = fs.existsSync(modelPath);

        if (modelExist) {
            const rawData = fs.readFileSync(modelPath, 'utf-8');
            const decodedData = JSON.parse(rawData);

            return decodedData;
        } else {
            throw new Error(`model ${modelName} isnt exists`);
        }
    }

    writeDataToModel (modelName: string, writeData: Array<any>): void {
        const modelPath = path.join(this.dbPath, modelName);
        const modelExist = fs.existsSync(modelPath);

        if (modelExist) {
            const data: ModelRawData = this.readModelData(modelName);

            data.data = data.data.concat(writeData);

            return fs.writeFileSync(modelPath, JSON.stringify(data))
        } else {
            throw new Error(`model ${modelName} isnt exists`);
        }
    }

    dropModelData (modelName: string): void {
        const modelPath = path.join(this.dbPath, modelName);
        const modelExist = fs.existsSync(modelPath);

        if (modelExist) {
            const rawData: ModelRawData = this.readModelData(modelName);

            rawData.data = [];

            return fs.writeFileSync(modelPath, JSON.stringify(rawData));
        } else {
            throw new Error(`model ${modelName} isnt exists`);
        }
    }

    deleteDataFromModel (modelName: string, deleteData: ModelData): void {
        const modelPath = path.join(this.dbPath, modelName);
        const modelExist = fs.existsSync(modelPath);

        if (modelExist) {
            const data: ModelRawData = this.readModelData(modelName);

            const docs = data.data;

            const filteredDocs = docs.filter((element: {[name: string]: any}) => {
                for (const doc of deleteData) {
                    if (isDeepStrictEqual(doc, element)) return null;
                }

                return element;
            });

            data.data = filteredDocs;

            return fs.writeFileSync(modelPath, JSON.stringify(data));
        } else {
            throw new Error(`model ${modelName} isnt exists`);
        }
    }
}