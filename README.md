# Azure Function Notify to Slack App Service when instance become unhealthy

## Getting Started

Add `local.settings.json`

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true"
    },
  "ConnectionStrings": {}
}
```

Local Dev

```bash
npm install
npm run dev
```

## Deploy


1. Create Azure Functions on Portal
2. 

---


<p align="center">
  <a href="https://github.com/mildronize/nammatham/" target="blank"><img src="https://i.ibb.co/QmTh7x4/Nammatham-Logo-v2.png" width="120" alt="Nammatham Logo" /></a>
</p>

<p align="center">
Azure Function Lightweight frameworks with DI, providing type safe function bindings
</p>

<p align="center"><a href="https://github.com/mildronize/nammatham/actions/workflows/test.yml"><img src="https://github.com/mildronize/nammatham/actions/workflows/test.yml/badge.svg" alt="Build &amp; Test"></a> <a href="https://codecov.io/gh/mildronize/nammatham"><img src="https://codecov.io/gh/mildronize/nammatham/branch/main/graph/badge.svg?token=Y7ZMDKFPAN" alt="codecov"></a> <a href="https://www.npmjs.com/package/nammatham"><img src="https://img.shields.io/npm/v/nammatham" alt="npm version"></a> <a href="https://www.npmjs.com/package/nammatham"><img src="https://img.shields.io/npm/dt/nammatham" alt="npm download"></a></p>

## Nammatham Starter

Simple starter boilerplate for running Nammatham

## Description
Nammatham (นามธรรม in Thai, pronounced `/naam ma tham/`, means **abstract** in Thai) is Azure Function Nodejs Lightweight frameworks with Dependency Injection, 


## Compatibility with Azure Functions
- [Azure Function NodeJs](https://github.com/Azure/azure-functions-nodejs-worker/) : v3.x (`@azure/functions`)
- [Runtime Version](https://docs.microsoft.com/azure/azure-functions/functions-versions): 4 ([Source Code](https://github.dev/Azure/azure-functions-host/tree/release/4.x))
- Node.js Versions: 16, 18


## Introduction

**Nammatham** is a framework that allows you to use Azure Functions with TypeScript and decorators. It provides pre-defined JSON binding objects and utility functions, such as `httpTrigger`, to make it easier to create Azure Functions.

Example:

```ts
import { AuthorizationLevel, BaseFunction, functionName, httpTrigger } from "nammatham";
import { HttpRequest } from "@azure/functions";

@functionName("GetUsers", httpTrigger(AuthorizationLevel.Anonymous, ["get"]))
export class UserFunction extends BaseFunction {

  public override execute(req: HttpRequest): void {
    const name = req.query.name;  
    this.res.send(`hello get user with ${name}`);
  }
}
```

## Features
- Provide basic utility for writing Azure Functions
- Only support TypeScript and [InversifyJS](https://github.com/inversify/Inversify) as the [Most Popular Inversion of Control Container and Dependency Injection Approach](https://npmtrends.com/awilix-vs-bottlejs-vs-inversify-vs-node-dependency-injection-vs-tsyringe-vs-typedi-vs-typescript-ioc) 
- Binding & Trigger Built-in type support
  - Http Trigger
  - Timer Trigger
  - Cosmos DB Trigger
  - If your binding type isn't in the list, please use [Support custom type](docs/define-azure-function.md#custom-binding)
  - You can see [All available type support](docs/binding-type.md) or create a PR ;).
- Build Tool Agnostic, this framework just provide the library. It can work with all TypeScript build tool e.g. tsc, esbuild, etc.


## Getting Started

Dev

```bash
npm run dev
```

Build

```bash
npm run build
```

## Documentation

Please read the [full documentation in the repo](https://github.com/mildronize/nammatham/tree/main/docs)

## Author
- Thada Wangthammang, Software Engineer, Thailand

## Ref
- Hot Reload Issues: https://github.com/Azure/azure-functions-core-tools/issues/1239#issuecomment-1315565942

.