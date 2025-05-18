import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { z } from 'zod';
import { verifyJWT } from '../../../lib/server/jwt';

// Dein Schema zur Validierung
const feedbackSchema = z.object({
  efficiency: z.coerce.number().int(),
  motivation: z.coerce.number().int()
});

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = Object.fromEntries(await request.formData());

    const parsed = feedbackSchema.safeParse(data);
    if (!parsed.success) {
      return fail(400, { error: 'Ungültige Eingabedaten' });
    }

    const { efficiency, motivation } = parsed.data;
    const timestamp = Date.now();

    try {
      // Beispiel: JWT vom Cookie holen und decoded ID extrahieren
      const jwt = cookies.get('authToken'); // Falls du JWT im Cookie hast
      const userId = verifyJWT(jwt)?.id ?? 0;

      // DB-Eintrag
      await db.query(
        'INSERT INTO session (time, efficiency, motivated, completedby) VALUES (0, ?, ?, ?)',
        [efficiency, motivation, userId]
      );

      return { success: 'Feedback gespeichert!' };
    } catch (err) {
      console.error(err);
      return fail(500, { error: 'Fehler beim Speichern' });
    }
  }
};
