const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка CORS
app.use(cors());
app.use(bodyParser.json());

// Настройка загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx|jpg|jpeg|png|txt/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Разрешены только файлы PDF, DOC, DOCX, JPG, PNG и TXT'));
        }
    }
});

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Маршруты API
app.post('/api/print', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'Файл не был загружен' });
    }

    const { copies, color } = req.body;
    
    // Здесь должна быть логика отправки на реальный принтер
    // В демо-версии просто имитируем печать
    
    setTimeout(() => {
        res.json({ 
            success: true, 
            message: `Файл "${req.file.originalname}" успешно отправлен на печать`,
            details: {
                copies: copies || 1,
                color: color === 'true',
                fileSize: req.file.size,
                fileName: req.file.originalname
            }
        });
        
        // В реальном приложении файл нужно удалить после печати
        // fs.unlinkSync(req.file.path);
    }, 2000);
});

app.post('/api/scan', (req, res) => {
    const { format, quality, duplex } = req.body;
    
    // Имитация сканирования
    setTimeout(() => {
        const scanId = uuidv4();
        res.json({
            success: true,
            scanId,
            scanUrl: `/scans/${scanId}.jpg`,
            details: {
                format: format || 'A4',
                quality: quality || '300',
                duplex: duplex === 'true',
                timestamp: new Date().toISOString()
            }
        });
    }, 3000);
});

app.post('/api/copy', (req, res) => {
    const { copies, originalType, copyType, scale, contrast } = req.body;
    
    // Имитация копирования
    setTimeout(() => {
        res.json({
            success: true,
            copies: copies || 1,
            originalType,
            copyType,
            scale,
            contrast: contrast === 'true'
        });
    }, 2000);
});

app.get('/api/templates/:name', (req, res) => {
    const templates = {
        'application': {
            name: 'Заявление',
            content: 'Шаблон заявления...'
        },
        'contract': {
            name: 'Договор',
            content: 'Шаблон договора...'
        },
        // Добавьте другие шаблоны
    };
    
    const template = templates[req.params.name];
    if (template) {
        res.json({ success: true, template });
    } else {
        res.status(404).json({ success: false, error: 'Шаблон не найден' });
    }
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: err.message });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер QuickPrint запущен на порту ${PORT}`);
    console.log(`Доступен по адресу: http://localhost:${PORT}`);
});
