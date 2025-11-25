import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Add file type restrictions if needed
    cb(null, true);
  }
});

// Get documents
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;

    const documents = await prisma.document.findMany({
      where: {
        ...(projectId && { projectId: projectId as string })
      },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        project: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload document
router.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { projectId } = req.body;

    // Determine document type based on mime type
    let docType: any = 'OTHER';
    if (req.file.mimetype.includes('pdf')) docType = 'PDF';
    else if (req.file.mimetype.includes('word') || req.file.mimetype.includes('document')) docType = 'DOC';
    else if (req.file.mimetype.includes('sheet') || req.file.mimetype.includes('excel')) docType = 'SPREADSHEET';
    else if (req.file.mimetype.includes('image')) docType = 'IMAGE';
    else if (req.file.mimetype.includes('video')) docType = 'VIDEO';

    const document = await prisma.document.create({
      data: {
        name: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        type: docType,
        projectId: projectId || null,
        uploaderId: req.user!.id
      },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });

    res.status(201).json(document);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Download document
router.get('/:id/download', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (!fs.existsSync(document.filePath)) {
      res.status(404).json({ error: 'File not found on server' });
      return;
    }

    res.download(document.filePath, document.name);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
