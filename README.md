# Sapiyon API

# Introduction

Sapiyon **REST** API is built with Node + MongoDB and Love. The API is hosted at [https://app.sapiyon.com/api](https://app.sapiyon.com/api);

The API is protected by JWT (JSON Web Token). Before user can access the API user must create an account via [User service](#user-service). After creation of account user needs to authetnicated as described in [Authentication](#auth-service)

# Endpoints

Following endpoints are available.

- `/authentication`
- `/users`
- `/user/recover-password`
- `/user/reset-password`
- `/user/locations`
- `/firms`
- `/customers`
- `/tasks`
- `/task/notes`
- `/task/files`
- `/firm/task-status`
- `/firm/teams`
- `/stock/items`
- `/stock/levels`
- `/stock/transactions`
- `/stock/bins`
- `/uploads`

# Models

## User

```
  {
    fullName: { type: String },
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, required: true },
    assignedTaskIds: {
      type: [mongooseClient.Schema.Types.ObjectId],
      default: [],
    },
    location: {
      type: {
        coordinates: {
          type: [Number],
          default: [],
        },
        createdAt: { type: Date, default: Date.now },
      },
    },
    phone: { type: String, default: '' },
    roleId: {
      type: mongooseClient.Types.ObjectId,
      required: true,
    },
    isOwner: { type: Boolean, default: false },
    address: {
      type: {
        line1: { type: String, default: '' },
        line2: { type: String, default: '' },
        state: { type: String, default: '' },
        city: { type: String, default: '' },
      },

      default: {},
    },
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String, default: '' },
    verifyExpires: {
      type: Date,
      required: true,
      default: addWeeks(Date.now(), 1),
    },
    resetToken: { type: String, default: '' },
    resetExpires: {
      type: Date,
      required: true,
      default: addWeeks(Date.now(), 1),
    },
    binId: {
      type: mongooseClient.Types.ObjectId,
    },
    teamIds: {
      type: [mongooseClient.Schema.Types.ObjectId],
    },
    fcmDeviceToken: { type: String, default: '' },
    isSharingLocation: { type: Boolean, default: false },

    signatureImgUrl: { type: String },

    deleted: { type: Boolean },
    userId: { type: mongooseClient.Types.ObjectId },
    firmId: { type: mongooseClient.Types.ObjectId, required: true },
  }
```

## Firm

```
  {
    businessName: { type: String, required: true },
    contactPerson: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: {
      type: {
        formatted: { type: String, default: '' },
        state: { type: String, default: '' },
        city: { type: String, default: '' },
        components: {
          type: [
            {
              long_name: { type: String },
              short_name: { type: String },
              types: { type: [String] },
            },
          ],
        },
        location: {
          type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true,
          },
          coordinates: {
            type: [Number],
            required: true,
          },
        },
      },
      default: {},
    },
    stockTags: {
      type: [StockTags],
    },

    deleted: { type: Boolean },
    userId: { type: mongooseClient.Types.ObjectId },
  }
```

## Customer

```
  {
    accountType: {
      type: String,
      required: true,
      enums: ['business', 'individual'],
    },

    businessName: { type: String, required: true },
    email: { type: String, default: '' },
    contactPerson: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: Address, default: {} },
    color: { type: String, default: '' },
  }
```

## Task Model

```
  {
    title: { type: String, required: true, minLength: 2, maxLength: 300 },
    endAt: { type: Date, required: false },

    notifyWith: {
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
    },

    customerId: {
      type: Schema.Types.ObjectId,
      required: false,
    },

    employeeId: {
      type: Schema.Types.ObjectId,
      required: false,
    },

    statusId: {
      type: Schema.Types.ObjectId,
      required: false,
    },

    stock: {
      type: [TaskStock],
    },

    files: {
      type: [TaskFile],
    },

    inWarranty: { type: Boolean, default: false, required: false },

    customerSignature: {
      type: { imgUrl: { type: String } },
    },
    employeeSignature: { type: { imgUrl: { type: String } } },

    noteIds: { type: [Schema.Types.ObjectId] },
    fileIds: { type: [Schema.Types.ObjectId] },
    notificationIds: { type: [Schema.Types.ObjectId] },

    userId: { type: Schema.Types.ObjectId, required: true },
    firmId: { type: Schema.Types.ObjectId, required: true }
  }
```

## Task Note

```
  {
    body: { type: String, required: true },
    taskId: {type: Schema.Types.ObjectId, required: true}
  }
```

## TaskStock

```
  {
    itemId: { type: Schema.Types.ObjectId },
    qty: { type: Number },
    unitPrice: { type: Number },
  }
```

## TaskStatus

```
  {
    title: String,
    required: false
  }
```

## StockItem

```
  {
    title: { type: String, required: true },
    description: { type: String },
    unitOfMeasurement: { type: String },
    unitPrice: { type: Number, default: 0, min: 0 },
    barcode: { type: String },
    type: {
      type: String,
      default: 'product',
      required: true,
      enums: ['product', 'service'],
    },
    tags: {
      type: [String],
      default: [],
      required: true,
    },
  }
```

## StockBin

```
  {
    title: { type: String, required: true }
  }
```

## Location

```
{
  coordinates: {
    type: [Number],
    required: true
  }
}
```

## Team

```
{
  title: {
    type: string,
    required: true
  },
  employeeIds: [type: Schema.Types.ObjectId]
}
```

## Upload

POST /uploads

```
{
  "uri": <- this must be multi-part form data key for file
}
```

Note: Its response will be used to save file for various purposes, task files, profile images etc. The id in response is the address for file.

BaseURL: https://sapiyon-user-content.s3-eu-west-1.amazonaws.com

TaskFiles

```
{
	"taskId": string,
	"mimeType": "image/png", <- this will be obtained after upload success
  "originalName": same as above,
	"url": same as above as `id`
}
```

# [Login](#auth-service)

```
POST /authentication
Content-Type: json/text

  {
    "email": "john@example.com",
    "password": "secret",
    "strategy": "local"
  }
```

# [Signup](#user-service)

```
POST /users
Content-Type: json/text

  {
    "fullName": "john doe",
    "email": "john@example.com",
    "password": "secret"
  }
```

# Querying

## Introduction

All endpoints (wiht few exceptions i.e. authentication) allow following query syntax. Below examples are only for tasks service but ideally these will work for most other services too, if there is any confusion feel free to discuss.

## Equality

All fields that do not contain special query parameters are compared directly for equality.

`GET /tasks?status=ongoing&firmId=2`

This will return all tasks where status == ongoing and firmId == 2

## \$limit

\$limit will return only the number of results you specify:

`GET /tasks?$limit=2&status=complete`

## \$skip

\$skip will skip the specified number of results:

`GET /tasks?$limit=2&$skip=2&status=ongoing`

## \$sort

\$sort will sort based on the object you provide. It can contain a list of properties by which to sort mapped to the order (1 ascending, -1 descending).

`/tasks?$limit=10&$sort[createdAt]=-1`

## \$select

\$select allows to pick which fields to include in the result. This will work for any service method.

```
GET /tasks?$select[]=field1&$select[]=field2
GET /tasks/1?$select[]=field1
```

## $in, $nin

Find all records where the property does ($in) or does not ($nin) match any of the given values.

`GET /tasks?status[$in]=ongoing&status[$in]=delayed`

## $lt, $lte

Find all records where the value is less ($lt) or less and equal ($lte) to a given value.

`GET /tasks?createdAt[$lt]=1479664146607`

## $gt, $gte

Find all records where the value is more ($gt) or more and equal ($gte) to a given value.

`GET /tasks?createdAt[$gt]=1479664146607`

## \$ne

Find all records that do not equal the given property value.

`GET /tasks?status[$ne]=completed`

## \$or

Find all records that match any of the given criteria.

`GET /tasks?$or[0][status][$ne]=delayed&\$or[1][status]=ongoing`

## \$search

Search by regex

`GET /tasks?\$search[title]=sometext
