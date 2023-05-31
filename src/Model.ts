import { FileSystem, ModelRawData } from "./FileSystem";
import { Schema } from "./Schema";

export interface ModelInitOptions {
    name: string;
    dbPath: string;
    schema: Schema;
}

export interface ModelMethodParams {
    [name: string]: any;
}

export interface ModelMethodOptions {
    count?: number;
    deleteMany?: boolean;
}

export type ModelData = Array<{[name: string]: any}>;

export class Model {
    public readonly name: string;
    public readonly dbPath: string;
    public readonly schema: Schema;
    private fs: FileSystem;

    constructor ({ name, dbPath, schema }: ModelInitOptions) {
        this.name = name;
        this.dbPath = dbPath;
        this.schema = schema;
        this.fs = new FileSystem({ dbPath });
    }

    write (data: ModelData) {
        for (const doc of data) {
            const validByScheme = this.schema.checkByScheme(doc, this);
        }

       const writed = this.fs.writeDataToModel(this.name, data);

       return writed;
    }

    get (params?: ModelMethodParams, options?: ModelMethodOptions): ModelData {
        const modelData: ModelRawData = this.fs.readModelData(this.name);
        const data: ModelData = modelData.data;

        if (params) {
            let gotData = data.filter((element: any) => {
                for (const key of Object.keys(element)) {
                    if (element[key] == params[key]) {
                        return element;
                    }
                }
            });

            if (options?.count) gotData = gotData.slice(0, options?.count);

            return gotData;
        }

        return data;
    }

    delete (params?: ModelMethodParams, options?: ModelMethodOptions) {
        if (params) {
            let gotDocs: ModelData = this.get(params);

            if (options?.count) gotDocs = gotDocs.slice(0, options?.count);

            return this.fs.deleteDataFromModel(this.name, gotDocs);
        } else {
            return this.fs.dropModelData(this.name);
        }
    }

    update (params: ModelMethodParams, dataToUpdate: ModelMethodParams, options?: ModelMethodOptions): void {
        if (!params || Object.keys(params).length == 0) {
            throw new Error(`not got update parameters; nothing to update`);
        }

        if (!dataToUpdate || Object.keys(dataToUpdate).length == 0) {
            throw new Error(`not got update data; nothing to update`);
        }

        const gotData = options?.count ? this.get(params, { count: options?.count }) : this.get(params);

        if (Object.keys(gotData).length == 0) {
            throw new Error(`cannot find docs by provided parameters; nothing to update`)
        }

        this.fs.deleteDataFromModel(this.name, gotData);
    
        const updatedData = gotData.map((element) => {
            for (const key of Object.keys(dataToUpdate)) {
                if (element[key]) {
                    element[key] = dataToUpdate[key];
                }
            }

            return element;
        });

        console.log(updatedData);

        for (const doc of updatedData) {
            const validBySchema = this.schema.checkByScheme(doc, this);
        }

        this.fs.writeDataToModel(this.name, gotData);
    }
}