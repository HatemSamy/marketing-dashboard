# Postman Requests for Marketing Dashboard API

Base URL: `http://localhost:3000` (adjust port based on your `.env` configuration)

---

## 📋 Table of Contents
1. [Health Check](#health-check)
2. [Root Endpoint](#root-endpoint)
3. [Campaign Endpoints](#campaign-endpoints)
   - [Create Campaign - Single Phone Number](#1-create-campaign---single-phone-number)
   - [Create Campaign - Multiple Phone Numbers](#2-create-campaign---multiple-phone-numbers)
   - [Create Campaign - Excel File (Text)](#3-create-campaign---excel-file-text)
   - [Create Campaign - Excel File (Image)](#4-create-campaign---excel-file-image)
   - [Create Campaign - Excel File (Video)](#5-create-campaign---excel-file-video)
   - [Get All Campaigns](#6-get-all-campaigns)
   - [Get Campaign By ID](#7-get-campaign-by-id)

---

## Health Check

**GET** `{{base_url}}/health`

### Response Example
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-05T05:38:08.000Z"
}
```

---

## Root Endpoint

**GET** `{{base_url}}/`

### Response Example
```json
{
  "success": true,
  "message": "WhatsApp Marketing Dashboard API",
  "version": "1.0.0",
  "endpoints": {
    "campaigns": "/api/campaigns",
    "messages": "/api/messages",
    "webhooks": "/api/webhooks/whatsapp"
  }
}
```

---

## Campaign Endpoints

> [!IMPORTANT]
> You can send campaigns using **TWO methods**:
> 1. **Direct Input**: Provide phone number(s) directly via `phoneNumbers` field (single or comma-separated)
> 2. **Excel File**: Upload an Excel file with phone numbers via `excelFile` field
> 
> **These methods are mutually exclusive** - use only one per request.

---

### 1. Create Campaign - Single Phone Number

**POST** `{{base_url}}/api/campaigns`

**Headers:**
- `Content-Type`: `multipart/form-data`

**Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `mediaType` | Text | `text` |
| `message` | Text | `Hello! Testing single number campaign.` |
| `phoneNumbers` | Text | `201234567890` |

**Response Example:**
```json
{
  "success": true,
  "message": "Campaign created successfully and processing started",
  "data": {
    "campaign": {
      "id": "65b1234567890abcdef12345",
      "mediaType": "text",
      "totalContacts": 1,
      "status": "pending",
      "createdAt": "2026-02-05T08:28:08.123Z"
    }
  }
}
```

---

### 2. Create Campaign - Multiple Phone Numbers

**POST** `{{base_url}}/api/campaigns`

**Headers:**
- `Content-Type`: `multipart/form-data`

**Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `mediaType` | Text | `text` |
| `message` | Text | `Special offer for our valued customers! 🎉` |
| `phoneNumbers` | Text | `201234567890,201098765432,201555666777` |

**Phone Numbers Format:**
- Single number: `201234567890`
- Multiple numbers: `201234567890,201098765432,201555666777` (comma-separated)
- International format without `+` sign
- 10-15 digits per number
- Spaces, dashes, and parentheses will be automatically removed

**Response Example:**
```json
{
  "success": true,
  "message": "Campaign created successfully and processing started",
  "data": {
    "campaign": {
      "id": "65b1234567890abcdef12345",
      "mediaType": "text",
      "totalContacts": 3,
      "status": "pending",
      "createdAt": "2026-02-05T08:28:08.123Z"
    }
  }
}
```

---

### 3. Create Campaign - Excel File (Text)

**POST** `{{base_url}}/api/campaigns`

**Headers:**
- `Content-Type`: `multipart/form-data`

**Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `mediaType` | Text | `text` |
| `message` | Text | `Hello! This is a test marketing message from our campaign.` |
| `excelFile` | File | Select your Excel file with phone numbers |

**Excel File Format:**
Your Excel file should have a column with phone numbers in international format:
```
PhoneNumber
201234567890
201098765432
```

**Response Example:**
```json
{
  "success": true,
  "message": "Campaign created successfully and processing started",
  "data": {
    "campaign": {
      "id": "65b1234567890abcdef12345",
      "mediaType": "text",
      "totalContacts": 150,
      "status": "pending",
      "createdAt": "2026-02-05T05:38:08.123Z"
    }
  }
}
```

---

### 4. Create Campaign - Excel File (Image)

**POST** `{{base_url}}/api/campaigns`

**Headers:**
- `Content-Type`: `multipart/form-data`

**Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `mediaType` | Text | `image` |
| `message` | Text | `Check out our latest products! 🎉` |
| `excelFile` | File | Select your Excel file |
| `mediaFile` | File | Select an image file (JPG, PNG, WebP) |

**Response Example:**
```json
{
  "success": true,
  "message": "Campaign created successfully and processing started",
  "data": {
    "campaign": {
      "id": "65b2345678901abcdef23456",
      "mediaType": "image",
      "totalContacts": 200,
      "status": "pending",
      "createdAt": "2026-02-05T05:40:15.456Z"
    }
  }
}
```

---

### 5. Create Campaign - Excel File (Video)

**POST** `{{base_url}}/api/campaigns`

**Headers:**
- `Content-Type`: `multipart/form-data`

**Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `mediaType` | Text | `video` |
| `message` | Text | `Watch our new promotional video! 📹` |
| `excelFile` | File | Select your Excel file |
| `mediaFile` | File | Select a video file (MP4, AVI, MOV) |

**Response Example:**
```json
{
  "success": true,
  "message": "Campaign created successfully and processing started",
  "data": {
    "campaign": {
      "id": "65b3456789012abcdef34567",
      "mediaType": "video",
      "totalContacts": 100,
      "status": "pending",
      "createdAt": "2026-02-05T05:42:30.789Z"
    }
  }
}
```

---

### 6. Get All Campaigns

**GET** `{{base_url}}/api/campaigns`

**Query Parameters (Optional):**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number for pagination |
| `limit` | Number | 10 | Number of campaigns per page |

**Example:**
```
GET {{base_url}}/api/campaigns?page=1&limit=20
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "_id": "65b1234567890abcdef12345",
        "message": "Hello! This is a test message.",
        "mediaType": "text",
        "mediaUrl": null,
        "totalContacts": 150,
        "sentCount": 145,
        "failedCount": 5,
        "status": "completed",
        "createdAt": "2026-02-05T05:38:08.123Z",
        "updatedAt": "2026-02-05T05:45:20.456Z"
      },
      {
        "_id": "65b2345678901abcdef23456",
        "message": "Check out our latest products!",
        "mediaType": "image",
        "mediaUrl": "/uploads/campaigns/image-123456.jpg",
        "totalContacts": 200,
        "sentCount": 180,
        "failedCount": 3,
        "status": "in-progress",
        "createdAt": "2026-02-05T05:40:15.456Z",
        "updatedAt": "2026-02-05T05:50:30.789Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

### 7. Get Campaign By ID

**GET** `{{base_url}}/api/campaigns/:id`

**Example:**
```
GET {{base_url}}/api/campaigns/65b1234567890abcdef12345
```

**Response Example (Success):**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "_id": "65b1234567890abcdef12345",
      "message": "Hello! This is a test message.",
      "mediaType": "text",
      "mediaUrl": null,
      "totalContacts": 150,
      "sentCount": 145,
      "failedCount": 5,
      "status": "completed",
      "createdAt": "2026-02-05T05:38:08.123Z",
      "updatedAt": "2026-02-05T05:45:20.456Z"
    }
  }
}
```

**Response Example (Not Found):**
```json
{
  "success": false,
  "message": "Campaign not found",
  "statusCode": 404
}
```

---

## 🚨 Common Error Responses

### 400 Bad Request - Missing Input
```json
{
  "success": false,
  "message": "Either phoneNumbers or excelFile is required",
  "statusCode": 400
}
```

### 400 Bad Request - Both Methods Provided
```json
{
  "success": false,
  "message": "Cannot provide both phoneNumbers and excelFile. Please use only one method.",
  "statusCode": 400
}
```

### 400 Bad Request - Invalid Phone Number Format
```json
{
  "success": false,
  "message": "Invalid phone number format: 123. Expected 10-15 digits in international format.",
  "statusCode": 400
}
```

### 400 Bad Request - Missing Media File
```json
{
  "success": false,
  "message": "Media file is required for image messages",
  "statusCode": 400
}
```

### 400 Bad Request - No Valid Phone Numbers
```json
{
  "success": false,
  "message": "No valid phone numbers found",
  "statusCode": 400
}
```

### 429 Too Many Requests (Rate Limit)
```json
{
  "success": false,
  "message": "Too many requests, please try again later.",
  "statusCode": 429
}
```

---

## 🔧 Postman Environment Variables

Create a Postman environment with the following variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |
| `campaign_id` | (empty) | Set after creating campaign |

---

## 📝 Testing Workflow

### Quick Test (Single Number)
1. **Start Server**: Make sure `npm run dev` is running
2. **Health Check**: Test `GET /health` to verify server is running
3. **Create Campaign**: Use POST `/api/campaigns` with:
   - `mediaType`: `text`
   - `message`: `Test message`
   - `phoneNumbers`: `201234567890`
4. **Save Campaign ID**: Copy the returned campaign ID
5. **Check Campaign**: Use GET `/api/campaigns/:id` with saved ID

### Full Test (Multiple Options)
1. Test single phone number (as above)
2. Test multiple phone numbers (comma-separated)
3. Test Excel file upload
4. Test error cases (both methods together, invalid numbers, etc.)
5. Check all campaigns with `GET /api/campaigns`

---

## 📂 Sample Excel File Structure

Create an Excel file (`contacts.xlsx`) with this structure:

| PhoneNumber |
|-------------|
| 201234567890 |
| 201098765432 |
| 201555666777 |

**Important Notes:**
- Phone numbers should be in international format (no + sign)
- First row should be the header "PhoneNumber"
- Each subsequent row contains one phone number
- Supported formats: `.xlsx`, `.xls`

---

## 🔍 Testing Tips

1. **Use Postman Collections**: Save all these requests in a collection for easy reuse
2. **Environment Variables**: Use `{{base_url}}` for easy switching between dev/prod
3. **Pre-request Scripts**: Add auth tokens if needed in future
4. **Tests Tab**: Add assertions to validate responses
5. **Console Logs**: Check Postman console for detailed request/response data

---

## 📊 Campaign Status Values

| Status | Description |
|--------|-------------|
| `pending` | Campaign created, not yet started |
| `in-progress` | Currently sending messages |
| `completed` | All messages sent |
| `failed` | Campaign failed to complete |

---

**Note**: This API is currently configured for public access. Add authentication middleware when deploying to production.
