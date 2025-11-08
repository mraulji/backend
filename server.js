const express = require('express');
const multer = require('multer');
const cors = require('cors');
const COS = require('ibm-cos-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// Validate required environment variables
const requiredEnvVars = [
  'COS_ENDPOINT',
  'COS_API_KEY',
  'COS_RESOURCE_INSTANCE_ID',
  'COS_BUCKET_NAME'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// COS client for regular uploads
const cos = new COS.S3({
  endpoint: process.env.COS_ENDPOINT,
  apiKeyId: process.env.COS_API_KEY,
  ibmAuthEndpoint: 'https://iam.cloud.ibm.com/identity/token',
  serviceInstanceId: process.env.COS_RESOURCE_INSTANCE_ID,
});

// COS client for requirement documents (only initialize if credentials are provided)
let cosRequirement = null;
if (process.env.COS_REQUIREMENT_ENDPOINT && 
    process.env.COS_REQUIREMENT_API_KEY && 
    process.env.COS_REQUIREMENT_RESOURCE_INSTANCE_ID) {
  cosRequirement = new COS.S3({
    endpoint: process.env.COS_REQUIREMENT_ENDPOINT,
    apiKeyId: process.env.COS_REQUIREMENT_API_KEY,
    ibmAuthEndpoint: 'https://iam.cloud.ibm.com/identity/token',
    serviceInstanceId: process.env.COS_REQUIREMENT_RESOURCE_INSTANCE_ID,
  });
  console.log('Requirement COS client initialized successfully');
} else {
  console.warn('Requirement COS credentials not provided. /UploadRequirementDoc endpoint will be disabled.');
}

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  const fileName = `${Date.now()}_${req.file.originalname}`;
  try {
    await cos.upload({
      Bucket: process.env.COS_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }).promise();
    res.json({ success: true, name: fileName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/UploadRequirementDoc', upload.single('file'), async (req, res) => {
  // Check if requirement COS client is initialized
  if (!cosRequirement) {
    return res.status(503).json({ 
      success: false, 
      error: 'Requirement document upload is not configured. Please contact administrator.' 
    });
  }
  
  if (!req.file) return res.status(400).send('No file uploaded.');
  const fileName = `requirement_${Date.now()}_${req.file.originalname}`;
  try {
    await cosRequirement.upload({
      Bucket: process.env.COS_REQUIREMENT_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }).promise();
    res.json({ success: true, name: fileName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('IBM COS File Upload Server');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
