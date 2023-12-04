---
layout: post
title: 'Creating a CRUD API with NodeJS, Express and MongoDB using TypeScript'
date: 2023-12-04 23:00:00 +0530
permalink: '/node-express-mongodb-typescript-crud'
categories: nodejs express mongodb typescript
---

Welcome to this step-by-step guide on setting up a NodeJS application with Express and MongoDB using TypeScript. In this tutorial, we'll walk through the process of creating a simple Notes app that demonstrates a CRUD (Create, Read, Update, Delete) API using this tech stack.

NodeJS, Express, and MongoDB form a powerful combination for building scalable and efficient web applications. TypeScript enhances the development experience by adding static typing to JavaScript, making the code more robust and maintainable. Follow the steps below to set up your development environment and create a basic Notes app.

## Setting Up NodeJS, Express and MongoDB with TypeScript

### Step 1: Install Dependencies

First, let's set up the project structure and install the necessary dependencies:

```bash
mkdir backend
cd backend

npm init -y

# Install typescript as a dev dependency
npm i -D typescript

# create tsconfig.json
npx tsc --init

# Install express
npm i express
npm i -D @types/express

# Install nodemon
npm i -D nodemon

# Install ts-node
npm i -D ts-node
```

### Step 2: Base Setup

Create `src` folder inside the root directory. Inside the `src` folder, create `server.ts` file and add the base server code.

```javascript
// server.ts
import express from 'express';
const app = express();

app.get('/', (req, res) => {
    res.send('Hello Node!');
});

const port = 5050;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

Update the `package.json` file to include a start script using nodemon.

```json
...
"scripts": {
    "start": "nodemon src/server.ts",
},
...
```

Now open the terminal and run the command: `npm start`  
This will start the server at port 5050

```bash
> backend@1.0.0 start
> nodemon src/server.ts

[nodemon] 3.0.2
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: ts,json
[nodemon] starting `ts-node src/server.ts`
Server running on port 5050
```

### Step 3: Setting Up Environment Variables

Set up environment variables using the `dotenv` and `envalid` packages. Create a `.env` file in the root directory with the desired port and install the required dependencies.

```
// .env
PORT=5050
```

Install the dependencies

```bash
npm i dotenv envalid
```

Create `validateEnv.ts` file inside `src/util` folder and put the below code:

```javascript
// src/util/validateEnv.ts
import { cleanEnv, port, str } from 'envalid';

export default cleanEnv(process.env, {
    PORT: port(),
});
```

Update the code in `server.ts`

```javascript
// server.ts
import 'dotenv/config';
import env from './util/validateEnv';
import express from 'express';
const app = express();

app.get('/', (req, res) => {
    res.send('Hello Node!');
});

const port = env.PORT || 5050;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

### Step 4: Setting Up MongoDB With Mongoose

Install Mongoose: `npm i mongoose`.  
Configure the MongoDB connection string in the .env file.

```
// .env
MONGO_CONNECTION_STRING=mongodb://127.0.0.1:27017/notesdb
PORT=5050
```

Update the `server.ts` file to connect to MongoDB using Mongoos

```javascript
// server.ts
import 'dotenv/config';
import env from './util/validateEnv';
import express from 'express';
import mongoose from 'mongoose';
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello Node!');
});

const port = env.PORT || 5050;

mongoose
    .connect(env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log(`Mongo DB connected.`);
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });
```

## Creating a CRUD Application

Now, let's create a Notes app with CRUD functionality.

### Step 1: Project Structure

Create the project structure with folders like `controllers`, `models`, `routes`, and `util`.

```bash
├── src
│   ├── app.ts
│   ├── controllers
│   │   └── notes.ts
│   ├── models
│   │   └── note.ts
│   ├── routes
│   │   └── notes.ts
│   ├── server.ts
│   └── util
│       └── validateEnv.ts
```

Create `app.ts` inside `src` directory. We will move some of the stuff from `server.ts` file to `app.ts`

```javascript
// app.ts
import 'dotenv/config';
import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello Node!');
});

export default app;
```

```javascript
// server.ts
import app from './app';
import env from './util/validateEnv';

const port = env.PORT || 5050;

mongoose
    .connect(env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log(`Mongo DB connected.`);
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });
```

### Step 2: Setup Express Error Handling

Enhance error handling by adding middleware to manage 404 errors and generic server errors using the `http-errors` package.

Install dependency: `npm i http-errors`
Add the following code in the `app.ts` file at the end but before the export statement.

```javascript
// app.ts
...
import express, { NextFunction, Request, Response } from 'express';
import createHttpError, { isHttpError } from 'http-errors';
...

// This will handle the error when api path is not defined
app.use((req, res, next) => {
    next(createHttpError(404, 'Endpoint not found'));
});

/* eslint-disable @typescript-eslint/no-unused-vars */
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    let errorMessage = 'An unknown error occurred';
    let statusCode = 500;
    if (isHttpError(error)) {
        statusCode = error.status;
        errorMessage = error.message;
    }
    res.status(statusCode).json({ error: errorMessage });
});

export default app;
```

### Step 3: Creating Notes Model

Create a Mongoose schema for the Note model inside the `models` folder. This schema includes fields such as title and text.

```javascript
// src/models/note.ts
import { InferSchemaType, Schema, model } from 'mongoose';

const noteSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        text: {
            type: String,
        },
    },
    { timestamps: true }
);

type Note = InferSchemaType<typeof noteSchema>;

export default model < Note > ('Note', noteSchema);
```

### Step 4: Creating controller for the Notes API

Create a controller file `notes.ts` inside the `controllers` folder. Implement the logic for creating a new note.

```javascript
// src/controllers/notes.ts

import { RequestHandler } from 'express';
import NoteModal from '../models/note';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';

interface CreateNoteBody {
    title?: string;
    text?: string;
}

export const createNote: RequestHandler<
    unknown,
    unknown,
    CreateNoteBody,
    unknown
> = async (req, res, next) => {
    const title = req.body.title;
    const text = req.body.text;

    try {
        if (!title) {
            throw createHttpError(400, 'Title is required');
        }

        const newNote = await NoteModal.create({
            title: title,
            text: text,
        });

        res.status(201).json(newNote);
    } catch (error) {
        next(error);
    }
};
```

### Step 5: Add Route For Note Creation

Create a `notes.ts` file inside the `routes` folder.

```javascript
// src/routes/notes.ts
import express from 'express';
import * as NotesController from '../controllers/notes';

const router = express.Router();

router.post('/', NotesController.createNote);

export default router;
```

Import the create route in the `app.ts` file.

```javascript
// src/app.ts
...
import notesRoutes from './routes/notes';
...

app.use(express.json());

app.use('/api/notes', notesRoutes);

...
```

**API Endpoint:** POST `http://localhost:5050/api/notes`

### Step 6: Fetch All The Notes

Implement functionality to fetch all notes and display them using a GET endpoint.

```javascript
// src/controllers/notes.ts

export const getNotes: RequestHandler = async (req, res, next) => {
    try {
        const notes = await NoteModal.find().exec();
        res.status(200).json(notes);
    } catch (error) {
        next(error);
    }
};
```

```javascript
// src/routes/notes.ts

router.get('/', NotesController.getNotes);
```

**API Endpoint:** GET `https://localhost:5050/api/notes`

### Step 7: Fetch Note By ID

Create an endpoint to retrieve a specific note by its ID using a GET request.

```javascript
// src/controllers/notes.ts

export const getNote: RequestHandler = async (req, res, next) => {
    const noteId = req.params.noteId;
    try {
        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, 'Invalid note id');
        }
        const note = await NoteModal.findById(noteId).exec();

        if (!note) {
            throw createHttpError(404, 'Note not found');
        }

        res.status(200).json(note);
    } catch (error) {
        next(error);
    }
};
```

```javascript
// src/routes/notes.ts

router.get('/:noteId', NotesController.getNote);
```

**API Endpoint:** GET `http://localhost:5050/api/notes/<noteId>`

### Step 8: Updating Note

Add the ability to update a note using a PUT request.

```javascript
// src/controllers/notes.ts

interface UpdateNoteParams {
    noteId: string;
}

interface UpdateNoteBody {
    title?: string;
    text?: string;
}

export const updateNote: RequestHandler<
    UpdateNoteParams,
    unknown,
    UpdateNoteBody,
    unknown
> = async (req, res, next) => {
    const noteId = req.params.noteId;
    const newTitle = req.body.title;
    const newText = req.body.text;
    try {
        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, 'Invalid note id');
        }

        if (!newTitle) {
            throw createHttpError(400, 'Title is required');
        }

        const note = await NoteModal.findById(noteId).exec();

        if (!note) {
            throw createHttpError(404, 'Note not found');
        }

        note.title = newTitle;
        note.text = newText;

        const updatedNote = await note.save();

        res.status(200).json(updatedNote);
    } catch (error) {
        next(error);
    }
};
```

```javascript
// src/routes/notes.ts

router.put('/:noteId', NotesController.updateNote);
```

**API Endpoint:** PUT `http://localhost:5050/api/notes/<noteId>`

### Step 9: Deleting Note

Implement a DELETE endpoint to delete a note by its ID.

```javascript
// src/controllers/notes.ts

export const deleteNote: RequestHandler = async (req, res, next) => {
    const noteId = req.params.noteId;

    try {
        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, 'Invalid note id');
        }

        const note = await NoteModal.findById(noteId).exec();

        if (!note) {
            throw createHttpError(404, 'Note not found');
        }

        await note.deleteOne();

        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};
```

```javascript
// src/routes/notes.ts

router.delete('/:noteId', NotesController.deleteNote);
```

**API Endpoint:** DELETE `http://localhost:5050/api/notes/<noteId>`

<hr>

Congratulations!🎉  
You've successfully set up a NodeJS application with Express and MongoDB using TypeScript. This blog covered the initial setup, environment variables, MongoDB integration, and the creation of a CRUD application for managing notes.

Check out the [source code on github](https://github.com/bekaarcoder/notes-app-ts/tree/main).

<br>
