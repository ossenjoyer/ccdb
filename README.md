# CCDB - Simple data storage tool, based on JSON


1. [About](#about)
2. [Examples](#examples)
3. [API Reference](#api-reference)
    - [Types](#types)
        - [ModelData](#modeldata)
    - [Enumerates](#enumerates)
        - [SchemaType](#schematype)
    - [Classes](#classes)
        - [Database](#database)
        - [Model](#model)
        - [Schema](#schema)
        - [SchemaField](#schemafield)
        - [FileSystem](#filesystem)
    - [Interfaces](#interfaces)
        - [FileSystemInitOptions](#filesysteminitoptions)
        - [ModelRawData](#modelrawdata)
        - [ModelInitOptions](#modelinitoptions)
        - [ModelMethodParams](#modelmethodparams)
        - [ModelMethodOptions](#modelmethodoptions)
        - [SchemaInitOptions](#schemainitoptions)
        - [SchemaFieldInitOptions](#schemafieldinitoptions)

# About

CCDB is a JSON-based storage tool, created for simplest data storaging.
You can modify database file personally, because CCDB database file just JSON doc;
CCDB works by scheme "one model - one database file". It's made to prevent main database file bloat;
CCDB have simple API for working with database data. Also, you can make model schemas for tipyzing your model data;
And this package wroten on Typescript, so you can use this package in Typescript too;

# Examples
```typescript
// typescript or javascript (ECMAScript)
import { Database, Model, Schema, SchemaType } from "ccdb";
import path from "path";

const dbPath = path.join(process.cwd(), "db");

const db = new Database({ path: dbPath });

const SimpleSchema = new Schema({
    name: {
        type: SchemaType.string
    }
});

const SimpleModel = new Model({name: "simple", dbPath: dbPath, schema: SimpleSchema});

db.addModel(SimpleModel);

SimpleModel.write([{name: "Alex"}, {name: "Joe"}, {name: "Alice"}]);

SimpleModel.delete({name: "Alex"}) // or SimpleModel.delete() for full data drop

SimpleModel.update({name: "Joe"}, {name: "John"});

SimpleModel.get() // reads all database data
```

```javascript
// javascript (CommonJS)
const {Database, Model, Schema, SchemaType} = require("ccdb")
const path = require("path");

const dbPath = path.join(process.cwd(), "db");

const db = new Database({ path: dbPath });

const SimpleSchema = new Schema({
    name: {
        type: SchemaType.string
    }
});

const SimpleModel = new Model({name: "simple", dbPath: dbPath, schema: SimpleSchema});

db.addModel(SimpleModel);

SimpleModel.write([{name: "Alex"}, {name: "Joe"}, {name: "Alice"}]);

SimpleModel.delete({name: "Alex"}) // or SimpleModel.delete() for full data drop

SimpleModel.update({name: "Joe"}, {name: "John"});

SimpleModel.get() // reads all database data
```

# API Reference

## Types

### ModelData
`Array<{[name: string]: any}>`

## Enumerates

### SchemaType
```
string = 'string',
number = 'number',
array = 'object',
object = 'object'
```

## Classes

### Database
1. Params
- `public readonly path: string` - path where database placed
- `public readonly fs: FileSystem` - instance of FileSystem class; for work with database files
- `public readonly models: Models[]` - a list of exist models
2. Methods
- `constructor({ path }: DatabaseInitOptions): Database` - constructor of Database class
- `addModel(model: Model): void` - adds new model to Database instance and makes file of the model

### Model
1. Params
- `public readonly name: string` - name of the model
- `public readonly dbPath: string` - path where database placed
- `public readonly schema: Schema` - schema of the model
- `private fs: FileSystem` - instance of FileSystem class; for work with model file
2. Methods
- `constructor({ name, dbPath, schema }: ModelInitOptions): Model` - constructor of Model class
- `get(params?: ModelMethodParams): ModelData` - returns docs filtered via provided parameters; returns all docs without parameters
- `write(data: ModelData): void` - writes some data to model file if data valids via schema
- `delete(params?: ModelMethodParams, options?: ModelMethodOptions): void` - deletes some docs from model file; removes all docs if parameters not provided
- `update(params: ModelMethodParams, dataToUpdate: ModelMethodParams, options?: ModelMethodOptions): void` - updates some docs via provided params and data; updates few documents, if options provided

### Schema
1. Params
- `public readonly schema: SchemaInitOptions` - main schema template
2. Methods
- `constructor(schema: SchemaInitOptions): Schema` - constructor of Schema class
- `checkByScheme(data: ModelMethodParams, model: Model): void` - checks data compliance by schema; returns error when data don't matchs schema

### SchemaField
1. Params
- `public readonly type: SchemaType`
- `public readonly max?: number`
- `public readonly min?: number`
- `public readonly maxLen?: number`
- `public readonly minLen?: number`
- `public readonly default?: any`
- `public readonly required?: boolean = false`
- `public readonly unique?: boolean = false`
2. Methods
- `constructor(field: SchemaFieldInitOptions): SchemaField` - constructor of SchemaField

### FileSystem
1. Params
- `private dbPath: string` - path where database placed
2. Methods
- `constructor({ dbPath }: FileSystemInitOptions): FileSystem` - constructor of FileSystemOptions
- `createDatabaseFolder(): void` -  creates database folder, where will contain model files
- `createDatabaseModel(model: Model): void` - creates databse model file
- `readModelData(modelName: string): ModelRawData` - returns all data about model
- `writeDataToModel(modelName: string, data: ModelData): void`- writes provided data to model
- `dropModelData(modelName: string): void` - drops all docs in model
- `deleteDataFromModel(modelName: string, data: ModelData): void` - removes provided docs from model

## Interfaces 

### DatabaseInitOptions
```
path: string;
```

### FileSystemInitOptions
```
dbPath: string;
```

### ModelRawData
```
name: string,
path: string,
schema: SchemaInitOptions,
data: Array<{[name: string]: any}>
```

### ModelInitOptions
```
name: string;
dbPath: string;
schema: Schema;
```

### ModelMethodParams
```
[name: string]: any
```

### ModelMethodOptions
```
count?: number;
deleteMany?: boolean;
```

### SchemaInitOptions
```
[name: string]: SchemaField
```

### SchemaFieldInitOptions
```
type: SchemaType;
max?: number;
min?: number;
maxLen?: number;
minLen?: number;
default?: any;
required?: boolean;
unique?: boolean;
```