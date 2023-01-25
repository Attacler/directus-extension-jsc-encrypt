# directus-jsc-encrypt

## Introduction

This package is designed for encrypting and decrypting data within Directus. It ensures that data is always stored in an encrypted form inside your database, and targets specific collection fields.

## Setup

To install the package, use either npm or yarn:

```sh
npm i directus-extension-jsc-encrypt
```

or

```sh
yarn add directus-extension-jsc-encrypt
```

Next, register two environment variables:

- DE_ENCRYPTION: A comma-separated list of collection fields that you want to encrypt, in the format "CollectionName.Field, CollectionName.Field2"
- DE_KEY: The encryption key you want to use, can be any random string

Restart your Directus instance to complete the setup.

## Supported Features

The package currently supports the following operations:

- Creating records
- Updating records
- Reading records

These operations can be performed via the Directus app, SDK, and API.
