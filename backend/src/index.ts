import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import { caseRoutes } from './routes/cases';
import { debtorRoutes } from './routes/debtors';
import { analyticsRoutes } from './routes/analytics';
import { agentRoutes } from './routes/agents';
import { predictionRoutes } from './routes/predictions';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
    origin: corsOrigins,
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'atlas-dca-backend',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// API Routes
app.use('/api/cases', authMiddleware, caseRoutes);
app.use('/api/debtors', authMiddleware, debtorRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/agents', authMiddleware, agentRoutes);
app.use('/api/predictions', authMiddleware, predictionRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Atlas DCA Backend running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL ? 'Configured' : 'Missing'}`);
});

export default app;
