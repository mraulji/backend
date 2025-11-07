# IBM Cloud Object Storage Upload Server

A Node.js Express server for uploading files to IBM Cloud Object Storage (COS).

## Features

- File upload endpoint with multipart/form-data support
- Direct integration with IBM Cloud Object Storage
- Environment-based configuration
- CORS enabled for cross-origin requests

## Prerequisites

- Node.js (v14 or higher)
- IBM Cloud account with Cloud Object Storage service
- IBM COS credentials (API Key, Resource Instance ID, Bucket Name)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```
COS_ENDPOINT=https://s3.<region>.cloud-object-storage.appdomain.cloud
COS_API_KEY=<your-api-key>
COS_RESOURCE_INSTANCE_ID=<your-resource-instance-id>
COS_BUCKET_NAME=<your-bucket-name>
PORT=3000
```

### Getting IBM COS Credentials

1. **API Key**: Create a service credential in IBM Cloud COS console
2. **Resource Instance ID**: Found in service credentials (starts with `crn:`)
3. **Bucket Name**: Create a bucket in IBM COS and use its name
4. **Endpoint**: Choose based on your bucket's region (e.g., `https://s3.us-south.cloud-object-storage.appdomain.cloud`)

## Usage

### Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

### API Endpoints

#### GET /
Health check endpoint.

**Response:**
```
IBM COS File Upload Server
```

#### POST /upload
Upload a file to IBM Cloud Object Storage.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with a file field named `file`

**Example using curl:**
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@/path/to/your/file.jpg"
```

**Example using JavaScript (fetch):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3000/upload', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data));
```

**Success Response:**
```json
{
  "success": true,
  "name": "1699334400000_filename.jpg"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Deployment

### Deploy to IBM Code Engine

1. Create a Code Engine project in IBM Cloud
2. Build and deploy:
```bash
ibmcloud ce application create --name cos-upload-server --build-source . --port 3000
```

3. Set environment variables in Code Engine console

### Deploy to Other Platforms

This server can be deployed to:
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure App Service
- Any platform supporting Node.js

Remember to set all required environment variables on your deployment platform.

## Project Structure

```
backend/
├── server.js          # Main application file
├── package.json       # Project dependencies
├── .env.example       # Example environment variables
├── .env              # Your environment variables (not in git)
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `COS_ENDPOINT` | IBM COS endpoint URL | Yes |
| `COS_API_KEY` | IBM Cloud API key | Yes |
| `COS_RESOURCE_INSTANCE_ID` | COS service instance ID | Yes |
| `COS_BUCKET_NAME` | Target bucket name | Yes |
| `PORT` | Server port (default: 3000) | No |

## Security Notes

- Never commit `.env` file to version control
- Rotate API keys regularly
- Use IBM Cloud IAM for access control
- Implement rate limiting for production use
- Add authentication/authorization as needed

## Troubleshooting

### Connection Issues
- Verify your COS endpoint matches your bucket's region
- Check that your API key has proper permissions

### Upload Failures
- Ensure bucket name is correct
- Verify IAM permissions for the service credential
- Check bucket CORS configuration if uploading from browser

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
