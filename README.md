# WhatsApp Marketing Dashboard Backend

A scalable Express.js backend system for sending bulk WhatsApp messages via UltraMessage API.

## Features

- ✅ Bulk WhatsApp message sending (text, image, video)
- ✅ Excel file upload and parsing for contacts
- ✅ Sequential message sending with configurable delays
- ✅ Rate limiting and retry logic
- ✅ Campaign management and tracking
- ✅ Message logging and status tracking
- ✅ Incoming message webhook handler
- ✅ MongoDB database with Mongoose
- ✅ Comprehensive error handling
- ✅ RESTful API design

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **File Processing**: Multer, XLSX
- **HTTP Client**: Axios
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- UltraMessage WhatsApp API account

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd marketing-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Start the server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Campaigns

#### Create Campaign
```http
POST /api/campaigns
Content-Type: multipart/form-data

Fields:
- mediaType: text | image | video
- message: (required for text, optional for image/video)
- excelFile: Excel file with contacts (.xlsx)
- mediaFile: (required for image/video)
```

#### Get All Campaigns
```http
GET /api/campaigns?page=1&limit=10
```

#### Get Campaign by ID
```http
GET /api/campaigns/:id
```

### Messages

#### Get Messages
```http
GET /api/messages?campaignId=xxx&phone=xxx&direction=outgoing&page=1&limit=50
```

### Webhooks

#### Receive Incoming Messages
```http
POST /api/webhooks/whatsapp

Body:
{
  "from": "+1234567890",
  "body": "User reply message",
  "type": "text"
}
```

#### Mark Message as Read
```http
PATCH /api/webhooks/whatsapp/:id/read
```

## Excel File Format

The Excel file must contain a column named **`phone`** (case insensitive).

Example:
```
| phone          | name    |
|----------------|---------|
| +1234567890    | John    |
| +9876543210    | Jane    |
```

## Project Structure

```
marketing-dashboard/
├── config/
│   ├── database.js         # MongoDB connection
│   ├── multer.js           # File upload config
│   └── rateLimiter.js      # Rate limiting config
├── src/
│   ├── models/
│   │   ├── Campaign.model.js
│   │   └── MessageLog.model.js
│   ├── services/
│   │   ├── ultraMessage.service.js
│   │   ├── excel.service.js
│   │   └── bulkSender.service.js
│   ├── controllers/
│   │   ├── campaign.controller.js
│   │   ├── message.controller.js
│   │   └── webhook.controller.js
│   ├── routes/
│   │   ├── campaign.routes.js
│   │   ├── message.routes.js
│   │   └── webhook.routes.js
│   ├── middlewares/
│   │   ├── error.middleware.js
│   │   ├── validation.middleware.js
│   │   └── upload.middleware.js
│   ├── validations/
│   │   ├── campaign.validation.js
│   │   └── webhook.validation.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── logger.js
│   │   ├── phoneValidator.js
│   │   └── fileValidator.js
│   └── app.js
├── uploads/                # File storage
├── .env                    # Environment variables
├── .gitignore
├── package.json
└── server.js
```

## How It Works

1. **Campaign Creation**:
   - User uploads Excel file with contacts and optional media
   - System validates files and parses phone numbers
   - Campaign is created with status "pending"
   - Bulk sending process starts asynchronously

2. **Bulk Sending**:
   - Messages are sent sequentially (not in parallel)
   - 1-2 second delay between each message
   - Each message is retried once on failure
   - Campaign continues even if some messages fail
   - Progress is tracked in real-time

3. **Message Logging**:
   - Every outgoing message is logged with status
   - Incoming messages from webhook are also logged
   - Messages can be filtered by campaign, phone, or direction

4. **Webhook Handling**:
   - Receives incoming WhatsApp replies
   - Links replies to original campaigns when possible
   - Marks messages as unread for inbox view

## Security Features

- Environment variables for sensitive data
- File upload validation and size limits
- Request validation using Joi schemas
- Rate limiting on all endpoints
- CORS protection
- Helmet security headers
- Centralized error handling

## Error Handling

The system includes comprehensive error handling for:
- File upload errors
- Excel parsing errors
- Phone number validation errors
- WhatsApp API errors
- Database errors
- Network errors

## Testing

### Manual Testing with cURL

1. **Create a text campaign**:
```bash
curl -X POST http://localhost:5000/api/campaigns \
  -F "mediaType=text" \
  -F "message=Hello from WhatsApp Marketing!" \
  -F "excelFile=@contacts.xlsx"
```

2. **Create an image campaign**:
```bash
curl -X POST http://localhost:5000/api/campaigns \
  -F "mediaType=image" \
  -F "message=Check out this image!" \
  -F "excelFile=@contacts.xlsx" \
  -F "mediaFile=@image.jpg"
```

3. **Get all campaigns**:
```bash
curl http://localhost:5000/api/campaigns
```

4. **Get messages**:
```bash
curl http://localhost:5000/api/messages?campaignId=xxx
```

## UltraMessage API Integration

The system integrates with UltraMessage API for WhatsApp messaging:

- **Text Messages**: `/messages/chat` endpoint
- **Image Messages**: `/messages/image` endpoint
- **Video Messages**: `/messages/video` endpoint

All API calls include automatic retry logic and comprehensive error handling.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
