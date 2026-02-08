# Postman Request Examples - Create Campaign

## 1. Text Message Campaign

**Method:** `POST`  
**URL:** `http://localhost:5000/api/campaigns`  
**Body:** `form-data`

| Key | Type | Value |
|-----|------|-------|
| mediaType | Text | `text` |
| message | Text | `Hello! This is a test message from our marketing campaign.` |
| phoneNumbers | Text | `201016626919` |

**Example with multiple numbers:**
```
phoneNumbers: 201016626919,201155624668,201234567890
```

---

## 2. Image Campaign (with Cloudinary)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/campaigns`  
**Body:** `form-data`

| Key | Type | Value |
|-----|------|-------|
| mediaType | Text | `image` |
| message | Text | `Check out our new product! 🎉` (optional caption) |
| phoneNumbers | Text | `201016626919` |
| mediaFile | File | [Select image file - jpg, png, etc.] |

---

## 3. Video Campaign (with Cloudinary)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/campaigns`  
**Body:** `form-data`

| Key | Type | Value |
|-----|------|-------|
| mediaType | Text | `video` |
| message | Text | `Watch our latest video! 🎥` (optional caption) |
| phoneNumbers | Text | `201016626919` |
| mediaFile | File | [Select video file - mp4, mov, etc.] |

---

## 4. Campaign with Excel File (Multiple Recipients)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/campaigns`  
**Body:** `form-data`

### For Text Message:
| Key | Type | Value |
|-----|------|-------|
| mediaType | Text | `text` |
| message | Text | `Bulk message to all contacts!` |
| excelFile | File | [Select Excel file with 'phone' column] |

### For Image with Excel:
| Key | Type | Value |
|-----|------|-------|
| mediaType | Text | `image` |
| message | Text | `Special offer for everyone! 🎁` |
| excelFile | File | [Select Excel file] |
| mediaFile | File | [Select image file] |

**Excel Format:**
```
| phone         | name (optional) |
|---------------|-----------------|
| 201016626919  | John           |
| 201155624668  | Sarah          |
| 201234567890  | Mike           |
```

---

## Expected Response

### Success (201 Created):
```json
{
  "success": true,
  "message": "Campaign created successfully and processing started",
  "data": {
    "campaign": {
      "id": "65c8f1a2e3b4d5e6f7089abc",
      "mediaType": "image",
      "totalContacts": 1,
      "status": "pending",
      "createdAt": "2026-02-08T18:30:00.000Z"
    }
  }
}
```

### Error (400 Bad Request):
```json
{
  "success": false,
  "message": "Validation error",
  "errors": "Media file is required for image messages"
}
```

---

## Important Notes

1. **File Fields:**
   - Use `mediaFile` for images/videos
   - Use `excelFile` for contact lists
   - Both are uploaded via `form-data`

2. **Phone Number Format:**
   - International format without '+' or spaces
   - Example: `201016626919` (Egypt)
   - Multiple numbers separated by commas

3. **Media Upload:**
   - Files are uploaded to Cloudinary automatically
   - You'll get a public URL in the response
   - Max file size: 50MB

4. **Mutual Exclusivity:**
   - Cannot use both `phoneNumbers` AND `excelFile`
   - Use one or the other

5. **Message Field:**
   - Required for `mediaType: text`
   - Optional for `mediaType: image` or `video` (becomes caption)

---

## Postman Collection JSON

Import this into Postman:

```json
{
  "info": {
    "name": "WhatsApp Marketing Dashboard",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Text Campaign",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "mediaType",
              "value": "text",
              "type": "text"
            },
            {
              "key": "message",
              "value": "Hello! This is a test message.",
              "type": "text"
            },
            {
              "key": "phoneNumbers",
              "value": "201016626919",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "http://localhost:5000/api/campaigns",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "campaigns"]
        }
      }
    },
    {
      "name": "Create Image Campaign",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "mediaType",
              "value": "image",
              "type": "text"
            },
            {
              "key": "message",
              "value": "Check out our new product!",
              "type": "text"
            },
            {
              "key": "phoneNumbers",
              "value": "201016626919",
              "type": "text"
            },
            {
              "key": "mediaFile",
              "type": "file",
              "src": []
            }
          ]
        },
        "url": {
          "raw": "http://localhost:5000/api/campaigns",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "campaigns"]
        }
      }
    },
    {
      "name": "Create Video Campaign",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "mediaType",
              "value": "video",
              "type": "text"
            },
            {
              "key": "message",
              "value": "Watch our latest video!",
              "type": "text"
            },
            {
              "key": "phoneNumbers",
              "value": "201016626919",
              "type": "text"
            },
            {
              "key": "mediaFile",
              "type": "file",
              "src": []
            }
          ]
        },
        "url": {
          "raw": "http://localhost:5000/api/campaigns",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "campaigns"]
        }
      }
    }
  ]
}
```
