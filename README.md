# Sensei-Frontend

## Overview
**Sensei-Frontend** is a modern web application designed to provide an interactive experience using advanced web technologies. The project integrates 3D visualizations with the Three.js library, connects with OpenAI for intelligent processing, and utilizes MediaPipe for vision tasks.

## Features
- **3D Visualization**: Utilizes Three.js for rendering dynamic 3D graphics.
- **AI Integration**: Connects with OpenAI's API to process and respond to user inputs.
- **Vision Capabilities**: Incorporates MediaPipe for advanced vision-related tasks.

## Prerequisites
Before setting up the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14 or newer)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Installation

Clone the repository to your local machine:

```bash
git clone https://example.com/sensei-frontend.git
cd sensei-frontend
```

## Configuration

Ensure you create an `env.ts` file in the root of the project to store all your environment variables, such as API keys for OpenAI:
```
export const env = {
    "OPENAI_API_KEY": "YOUR-API-KEY-HERE"
}
```
