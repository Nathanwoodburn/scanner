# @rosen-bridge/handshake-rpc-scanner

## Table of contents

- [@rosen-bridge/handshake-rpc-scanner](#rosen-bridgehandshake-rpc-scanner)
  - [Table of contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Testing](#testing)

## Introduction

A Handshake blockchain scanner based on HSD JSON RPC API
https://hsd-dev.org/api-docs/

## Installation

npm:

```sh
npm i @rosen-bridge/handshake-rpc-scanner
```

yarn:

```sh
yarn add @rosen-bridge/handshake-rpc-scanner
```

## Testing

To test the scanner's basic functionality:

1. Make sure you have a running Handshake node (HSD) with RPC enabled
2. Configure your node URL and API key in `tests/scannerTest.ts`
3. Install dependencies:
   ```
   npm install
   ```
4. Run the test script:
   ```
   node --loader ts-node/esm tests/scannerTest.ts
   ```

This will connect to your Handshake node, fetch blocks, and store them in a local SQLite database.