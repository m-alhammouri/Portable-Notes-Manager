import { Router, type IRouter } from "express";
import {
  CreateNoteBody,
  CreateNoteResponse,
  DeleteNoteParams,
  DeleteNoteResponse,
  GetNoteParams,
  GetNoteResponse,
  ListNotesQueryParams,
  ListNotesResponse,
  UpdateNoteBody,
  UpdateNoteParams,
  UpdateNoteResponse,
} from "@workspace/api-zod";
import {
  db,
  notesTable,
  type NoteRecord,
} from "@workspace/db";
import { desc, eq, ilike, or } from "drizzle-orm";

const router: IRouter = Router();

function toNoteResponse(note: NoteRecord) {
  return {
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

router.get("/notes", async (req, res): Promise<void> => {
  const query = ListNotesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const search = query.data.search?.trim();
  const notes = await db
    .select()
    .from(notesTable)
    .where(
      search
        ? or(
            ilike(notesTable.studentName, `%${search.replace(/[\\%_]/g, "\\$&")}%`),
            ilike(notesTable.title, `%${search.replace(/[\\%_]/g, "\\$&")}%`),
          )
        : undefined,
    )
    .orderBy(desc(notesTable.updatedAt), desc(notesTable.id));

  res.json(ListNotesResponse.parse(notes.map(toNoteResponse)));
});

router.post("/notes", async (req, res): Promise<void> => {
  const input = CreateNoteBody.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ error: input.error.message });
    return;
  }

  const values = {
    studentName: input.data.studentName.trim(),
    title: input.data.title.trim(),
    description: input.data.description,
  };

  if (!values.studentName || !values.title) {
    res.status(400).json({ error: "Student name and title are required." });
    return;
  }

  const [note] = await db.insert(notesTable).values(values).returning();
  res.status(201).json(CreateNoteResponse.parse(toNoteResponse(note)));
});

router.get("/notes/:id", async (req, res): Promise<void> => {
  const params = GetNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [note] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, params.data.id));

  if (!note) {
    res.status(404).json({ error: "Note not found." });
    return;
  }

  res.json(GetNoteResponse.parse(toNoteResponse(note)));
});

router.patch("/notes/:id", async (req, res): Promise<void> => {
  const params = UpdateNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const input = UpdateNoteBody.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ error: input.error.message });
    return;
  }

  const studentName = input.data.studentName.trim();
  const title = input.data.title.trim();
  if (!studentName || !title) {
    res.status(400).json({ error: "Student name and title are required." });
    return;
  }

  const [note] = await db
    .update(notesTable)
    .set({
      studentName,
      title,
      description: input.data.description,
      updatedAt: new Date(),
    })
    .where(eq(notesTable.id, params.data.id))
    .returning();

  if (!note) {
    res.status(404).json({ error: "Note not found." });
    return;
  }

  res.json(UpdateNoteResponse.parse(toNoteResponse(note)));
});

router.delete("/notes/:id", async (req, res): Promise<void> => {
  const params = DeleteNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [note] = await db
    .delete(notesTable)
    .where(eq(notesTable.id, params.data.id))
    .returning({ id: notesTable.id });

  if (!note) {
    res.status(404).json({ error: "Note not found." });
    return;
  }

  res.json(DeleteNoteResponse.parse({ id: note.id, deleted: true }));
});

export default router;
