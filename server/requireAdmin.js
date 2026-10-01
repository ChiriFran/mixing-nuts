import { getAdminAuth } from './firebaseAdmin.js';

export const requireAdmin = async (request, response) => {
  const expectedUid = process.env.FIREBASE_ADMIN_UID || process.env.VITE_ADMIN_UID;
  const authorization = request.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token || !expectedUid) {
    response.status(401).json({ error: 'Autenticación requerida.' });
    return false;
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    if (decodedToken.uid !== expectedUid) {
      response.status(403).json({ error: 'Acceso denegado.' });
      return false;
    }
    return true;
  } catch {
    response.status(401).json({ error: 'La sesión de administrador no es válida.' });
    return false;
  }
};