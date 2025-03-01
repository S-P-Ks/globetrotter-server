import express from 'express';
import { shareImage } from '../controllers/share-image.controllers';

const router = express.Router();

router.get('/', shareImage);

export default router;