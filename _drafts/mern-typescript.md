## Setting Up NodeJS, Express and MongoDB with TypeScript

### Step 1: Install Dependencies

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

Create `src` folder inside the root directory.  
Inside the `src` folder, create `server.ts` file.  
Now add the below code

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

In the `package.json` file, put the below script:

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

In the root directory, create a `.env` file and the port value.

```env
PORT=5050
```

Install the dependencies

```bash
npm i dotenv envalid
```

Create a `util` folder inside the `src` directory.  
Inside `util`, create `validateEnv.ts` file and put the below code:

```javascript
// validateEnv.ts
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

Install mongoose: `npm i mongoose`

Add the environment variable for mongodb url in `.env` file

```env
MONGO_CONNECTION_STRING=mongodb://127.0.0.1:27017/notesdb
PORT=5050
```

Setup the connection string for mongoose in the `server.ts` file

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

We will create a notes app.

### Step 1: Project Structure

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

Lets add a middleware to handle errors.

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

Create a file `note.ts` inside `models` folder. We will create a Note mongoose schema.

```javascript
// models/note.ts
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

Create a file `notes.ts` inside `controller` folder and add the following code.

```javascript
// controllers/notes.ts

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

Create a `notes.ts` file inside `routes` folder and add the following code:

```javascript
// src/routes/notes.ts
import express from 'express';
import * as NotesController from '../controllers/notes';

const router = express.Router();

router.post('/', NotesController.createNote);

export default router;
```

Now we will import the create route in `app.ts` file.

```javascript
// src/app.ts
...
import notesRoutes from './routes/notes';
...

app.use(express.json());

app.use('/api/notes', notesRoutes);

...
```

Create endpoint is ready at `http://localhost:5050/api/notes`

### Step 6: Fetch All The Notes

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

API Endpoint: GET `https://localhost:5050/api/notes`

### Step 7: Fetch Note By ID

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

API Endpoint: GET `http://localhost:5050/api/notes/<noteId>`

### Step 8: Updating Note

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

API Endpoint: PUT `http://localhost:5050/api/notes/<noteId>`

### Step 9: Deleting Note

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

API Endpoint: DELETE `http://localhost:5050/api/notes/<noteId>`
