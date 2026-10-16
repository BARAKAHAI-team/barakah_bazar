# BarakahBazaar API Documentation

Complete specification of all backend endpoints built within the Next.js App Router (`src/app/api/`).

---

## Standard Response Envelopes

### Standard Success Envelope
```json
{
  "ok": true,
  "data": { ... } // or explicit payload fields
}
```

### Standard Error Envelope
```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable explanation of failure"
  }
}
```

---

## 1. Authentication & Session

### 1.1 Request Login OTP
- **Method**: `POST`
- **Route**: `/api/auth/otp/request`
- **File Location**: [`src/app/api/auth/otp/request/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/auth/otp/request/route.ts)
- **Description**: Validates 10-digit Indian phone number, applies 30-second cooldown rate limiting, generates a 6-digit OTP, and sends it via SMS.

#### Request Body
```json
{
  "phone": "9876543210"
}
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "message": "OTP sent successfully.",
  "devOtp": "123456" // Returned only in development mode
}
```

#### Failed Responses
- **HTTP 400 (Invalid phone)**:
  ```json
  {
    "ok": false,
    "error": {
      "code": "INVALID_PHONE",
      "message": "Please enter a valid 10-digit Indian mobile number."
    }
  }
  ```
- **HTTP 429 (Rate limited)**:
  ```json
  {
    "ok": false,
    "error": {
      "code": "RATE_LIMITED",
      "message": "Please wait 24 seconds before requesting a new OTP."
    }
  }
  ```

---

### 1.2 Verify Login OTP
- **Method**: `POST`
- **Route**: `/api/auth/otp/verify`
- **File Location**: [`src/app/api/auth/otp/verify/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/auth/otp/verify/route.ts)
- **Description**: Validates the 6-digit OTP code against HMAC hash, creates user profile if new, and sets an HTTP-only session cookie (`bz_session`).

#### Request Body
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

#### Successful Response (HTTP 200)
*Sets HTTP-only cookie: `bz_session`*
```json
{
  "ok": true,
  "user": {
    "id": "usr_9876543210",
    "phone": "+919876543210",
    "name": "Customer Name"
  },
  "message": "Authenticated successfully."
}
```

#### Failed Responses
- **HTTP 400 (Invalid code)**:
  ```json
  {
    "ok": false,
    "error": {
      "code": "INVALID_OTP",
      "message": "Incorrect OTP. 2 attempts remaining."
    }
  }
  ```
- **HTTP 400 (Expired)**:
  ```json
  {
    "ok": false,
    "error": {
      "code": "EXPIRED",
      "message": "OTP has expired. Please request a new one."
    }
  }
  ```

---

### 1.3 Logout
- **Method**: `POST`
- **Route**: `/api/auth/logout`
- **File Location**: [`src/app/api/auth/logout/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/auth/logout/route.ts)
- **Description**: Clears the active `bz_session` authentication cookie.

#### Request Body
*None*

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "message": "Logged out successfully."
}
```

---

### 1.4 Get Profile
- **Method**: `GET`
- **Route**: `/api/me`
- **File Location**: [`src/app/api/me/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/me/route.ts)
- **Description**: Retrieves current user session identity and profile info.

#### Request
*Requires `bz_session` cookie*

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "user": {
    "userId": "usr_9876543210",
    "phone": "+919876543210",
    "profile": {
      "name": "Fatima Khan"
    }
  }
}
```

#### Failed Response (HTTP 401)
```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Login required."
  }
}
```

---

### 1.5 Update Profile Name
- **Method**: `PATCH`
- **Route**: `/api/me`
- **File Location**: [`src/app/api/me/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/me/route.ts)

#### Request Body
```json
{
  "name": "Fatima Z. Khan"
}
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "profile": {
    "name": "Fatima Z. Khan"
  }
}
```

---

## 2. Customer Delivery Addresses

### 2.1 List Saved Addresses
- **Method**: `GET`
- **Route**: `/api/addresses`
- **File Location**: [`src/app/api/addresses/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/addresses/route.ts)

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "addresses": [
    {
      "id": "addr_1",
      "user_id": "usr_9876543210",
      "name": "Fatima Khan",
      "phone": "9876543210",
      "line1": "Flat 4B, Emerald Heights",
      "line2": "Marine Drive",
      "city": "Kochi",
      "state": "Kerala",
      "pincode": "682001",
      "latitude": 9.9312,
      "longitude": 76.2673,
      "is_default": true
    }
  ]
}
```

---

### 2.2 Add New Address
- **Method**: `POST`
- **Route**: `/api/addresses`
- **File Location**: [`src/app/api/addresses/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/addresses/route.ts)

#### Request Body
```json
{
  "name": "Fatima Khan",
  "phone": "9876543210",
  "line1": "House #14, Royal Palm Ave",
  "line2": "Panampilly Nagar",
  "city": "Kochi",
  "state": "Kerala",
  "pincode": "682036",
  "latitude": 9.9575,
  "longitude": 76.2952,
  "isDefault": true
}
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "address": {
    "id": "addr_1729065600000",
    "name": "Fatima Khan",
    "city": "Kochi",
    "pincode": "682036"
  }
}
```

---

### 2.3 Delete Address
- **Method**: `DELETE`
- **Route**: `/api/addresses/[id]`
- **File Location**: [`src/app/api/addresses/[id]/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/addresses/%5Bid%5D/route.ts)

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "message": "Address deleted."
}
```

---

## 3. Shopping Cart

### 3.1 Fetch Cart & Pricing
- **Method**: `GET`
- **Route**: `/api/cart`
- **File Location**: [`src/app/api/cart/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/cart/route.ts)

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "items": [
    {
      "id": "cart_1",
      "variant_id": "oil-300ml",
      "quantity": 2,
      "unit_price_paise": 14900,
      "line_total_paise": 29800,
      "product_name": "Pure Coconut Oil 300ml",
      "image_url": "/images/home/oil/image-5.jpeg"
    }
  ],
  "subtotalPaise": 29800,
  "totalQty": 2
}
```

---

### 3.2 Add Item to Cart
- **Method**: `POST`
- **Route**: `/api/cart` (or `/api/cart/items`)
- **File Location**: [`src/app/api/cart/items/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/cart/items/route.ts)

#### Request Body
```json
{
  "variant_id": "oil-500ml",
  "quantity": 1
}
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "message": "Item added to cart."
}
```

---

### 3.3 Update Item Quantity
- **Method**: `PATCH`
- **Route**: `/api/cart/items/[id]`
- **File Location**: [`src/app/api/cart/items/[id]/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/cart/items/%5Bid%5D/route.ts)

#### Request Body
```json
{
  "quantity": 3
}
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "message": "Cart item updated."
}
```

---

### 3.4 Remove Item from Cart
- **Method**: `DELETE`
- **Route**: `/api/cart/items/[id]`
- **File Location**: [`src/app/api/cart/items/[id]/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/cart/items/%5Bid%5D/route.ts)

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "message": "Item removed from cart."
}
```

---

## 4. Wishlist

### 4.1 Get Wishlist Product IDs
- **Method**: `GET`
- **Route**: `/api/wishlist`
- **File Location**: [`src/app/api/wishlist/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/wishlist/route.ts)

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "productIds": [
    "emerald-zari-suit",
    "pure-coconut-oil-500ml"
  ]
}
```

---

### 4.2 Toggle Wishlist Item
- **Method**: `POST`
- **Route**: `/api/wishlist`
- **File Location**: [`src/app/api/wishlist/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/wishlist/route.ts)

#### Request Body
```json
{
  "productId": "emerald-zari-suit"
}
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "isWishlisted": true,
  "productIds": [
    "emerald-zari-suit"
  ]
}
```

---

## 5. Orders & Checkout

### 5.1 Create Order from Cart
- **Method**: `POST`
- **Route**: `/api/orders`
- **File Location**: [`src/app/api/orders/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/orders/route.ts)
- **Description**: Takes cart items and address to create an order in `PENDING_PAYMENT` state with a unique `order_number` (`BZ-YYMMDD-XXXX`).

#### Request Body
```json
{
  "addressId": "addr_1",
  "email": "customer@example.com"
}
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "order": {
    "id": "ord_1729065600000",
    "order_number": "BZ-261016-0001",
    "user_id": "usr_9876543210",
    "subtotal_paise": 29800,
    "discount_paise": 0,
    "total_paise": 29800,
    "payment_status": "PENDING",
    "order_status": "PENDING_PAYMENT",
    "items": [
      {
        "product_name": "Pure Coconut Oil 300ml",
        "qty": 2,
        "unit_price_paise": 14900
      }
    ]
  }
}
```

---

### 5.2 Apply Promotional Coupon
- **Method**: `POST`
- **Route**: `/api/orders/[id]/coupon`
- **File Location**: [`src/app/api/orders/[id]/coupon/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/orders/%5Bid%5D/coupon/route.ts)

#### Request Body
```json
{
  "code": "BARAKAH10"
}
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "coupon": "BARAKAH10",
  "discountPaise": 2980,
  "totalPaise": 26820
}
```

#### Failed Response (HTTP 400)
```json
{
  "ok": false,
  "error": {
    "code": "INVALID_COUPON",
    "message": "Invalid or expired coupon code."
  }
}
```

---

### 5.3 Remove Coupon
- **Method**: `DELETE`
- **Route**: `/api/orders/[id]/coupon`
- **File Location**: [`src/app/api/orders/[id]/coupon/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/orders/%5Bid%5D/coupon/route.ts)

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "message": "Coupon removed.",
  "totalPaise": 29800
}
```

---

## 6. Razorpay Payments

### 6.1 Create Razorpay Order
- **Method**: `POST`
- **Route**: `/api/payments/create`
- **File Location**: [`src/app/api/payments/create/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/payments/create/route.ts)
- **Description**: Connects to Razorpay SDK using `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` to generate an official Razorpay Order ID.

#### Request Body
```json
{
  "orderId": "ord_1729065600000"
}
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "razorpayOrderId": "order_ODZ184KzQo5y5W",
  "keyId": "rzp_test_51AbcDefGh",
  "amount": 26820
}
```

---

### 6.2 Verify Razorpay Signature
- **Method**: `POST`
- **Route**: `/api/payments/verify`
- **File Location**: [`src/app/api/payments/verify/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/payments/verify/route.ts)
- **Description**: Verifies the HMAC-SHA256 signature generated by the client Razorpay checkout popup. On success, transitions order to `CONFIRMED` and `PAID`, clears cart, and dispatches confirmation notifications.

#### Request Body
```json
{
  "razorpay_order_id": "order_ODZ184KzQo5y5W",
  "razorpay_payment_id": "pay_ODZ2099Lm10qW",
  "razorpay_signature": "9ef6a084687d894b92b61f9dfa2862d295b9b7e7c81d83"
}
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "orderNumber": "BZ-261016-0001",
  "paymentStatus": "PAID"
}
```

#### Failed Response (HTTP 400)
```json
{
  "ok": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Payment signature mismatch."
  }
}
```

---

### 6.3 Razorpay Webhook Handler
- **Method**: `POST`
- **Route**: `/api/payments/webhook`
- **File Location**: [`src/app/api/payments/webhook/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/payments/webhook/route.ts)
- **Description**: Server-to-server webhook endpoint triggered by Razorpay servers for events like `payment.captured` or `order.paid`.

#### Headers
```http
x-razorpay-signature: <hmac_hex_digest>
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "received": true
}
```

---

## 7. Product Reviews

### 7.1 Fetch Reviews for Product
- **Method**: `GET`
- **Route**: `/api/products/[id]/reviews`
- **File Location**: [`src/app/api/products/[id]/reviews/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/products/%5Bid%5D/reviews/route.ts)

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "reviews": [
    {
      "id": "rev_1",
      "user_name": "Ayesha R.",
      "rating": 5,
      "title": "Exceptional embroidery and drape",
      "body": "The gold tilla needlework is even more magnificent in person.",
      "created_at": "2026-10-12T10:00:00Z"
    }
  ],
  "averageRating": 4.9,
  "totalReviews": 18
}
```

---

### 7.2 Submit Product Review
- **Method**: `POST`
- **Route**: `/api/products/[id]/reviews`
- **File Location**: [`src/app/api/products/[id]/reviews/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/products/%5Bid%5D/reviews/route.ts)

#### Request Body
```json
{
  "rating": 5,
  "title": "Truly Authentic Purity",
  "body": "Fresh scent of sun-dried Kerala copra. Best coconut oil I have purchased."
}
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "message": "Review submitted successfully."
}
```

---

### 7.3 Check Review Eligibility
- **Method**: `GET`
- **Route**: `/api/products/[id]/review-eligibility`
- **File Location**: [`src/app/api/products/[id]/review-eligibility/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/products/%5Bid%5D/review-eligibility/route.ts)

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "canReview": true
}
```

---

## 8. Utilities & System Jobs

### 8.1 Active Site Notices Banner
- **Method**: `GET`
- **Route**: `/api/site-notices`
- **File Location**: [`src/app/api/site-notices/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/site-notices/route.ts)

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "notice": {
    "text": "Festive Special: Enjoy Free Pan-India Delivery on all orders above ₹1,499."
  }
}
```

---

### 8.2 Scheduled Notification Job
- **Method**: `POST`
- **Route**: `/api/jobs/notifications`
- **File Location**: [`src/app/api/jobs/notifications/route.ts`](https://github.com/BARAKAHAI-team/barakah_bazar/blob/main/src/app/api/jobs/notifications/route.ts)

#### Headers
```http
Authorization: Bearer <JOBS_SECRET>
```

#### Successful Response (HTTP 200)
```json
{
  "ok": true,
  "processedCount": 4
}
```
