# NelsyFit API Documentation

## Base URL
Production: `https://your-domain.com/api`
Development: `http://localhost:3000/api`

## Authentication

Most endpoints require authentication via session cookies set after login.

## Endpoints

### Authentication

#### POST /api/auth/check-code
Check if a temporary access code is valid.

**Request Body:**
```json
{
  "code": "ABC12345"
}
```

**Response:**
```json
{
  "valid": true,
  "code": {
    "type": "TRIAL_CODE",
    "trialDays": 7,
    "assignedTier": "PREMIUM_MONTHLY"
  }
}
```

**Error Response:**
```json
{
  "valid": false,
  "error": "Code has expired"
}
```

#### POST /api/auth/redeem-code
Redeem a temporary access code. Requires authentication.

**Request Body:**
```json
{
  "code": "ABC12345"
}
```

**Response:**
```json
{
  "success": true,
  "trialDays": 7
}
```

### Billing

#### POST /api/billing/create-subscription
Create a new subscription.

**Request Body:**
```json
{
  "priceId": "price_1234567890",
  "paymentMethodId": "pm_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "sub_1234567890",
  "clientSecret": "pi_1234567890_secret_..."
}
```

#### POST /api/billing/update-subscription
Update an existing subscription.

**Request Body:**
```json
{
  "subscriptionId": "sub_1234567890",
  "priceId": "price_0987654321"
}
```

#### POST /api/billing/cancel-subscription
Cancel a subscription.

**Request Body:**
```json
{
  "subscriptionId": "sub_1234567890"
}
```

#### GET /api/billing/history
Get payment history. Requires authentication.

**Response:**
```json
{
  "payments": [
    {
      "id": "...",
      "amount": 2999,
      "currency": "usd",
      "status": "SUCCEEDED",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/billing/webhook
Stripe webhook endpoint. Handles:
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Headers:**
- `stripe-signature`: Stripe webhook signature

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message here"
}
```

Status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

