import { FileSystem } from "./FileSystem";
import { Model } from "./Model";

export interface DatabaseInitOptions {
    path: string;
} 

export class Database {
    public readonly path: string;
    public readonly fs: FileSystem;
    public readonly models: Model[] = [];

    constructor ({ path }: DatabaseInitOptions) {
        this.path = path;
        this.fs = new FileSystem({ dbPath: path });

        this.fs.createDatabaseFolder();
    }

    addModel (model: Model) {
        for (const existModel of this.models) {
            if (existModel.name == model.name) {
                return;
            }
        }

        this.fs.createDatabaseModel(model);

        return this.models.push(model);
    }
}