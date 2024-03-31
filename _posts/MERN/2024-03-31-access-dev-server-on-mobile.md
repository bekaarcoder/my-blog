---
layout: post
title: 'How to Access the Localhost Development Server on Another Device'
date: 2024-03-31 12:40:05 +0530
permalink: '/access-dev-server-on-mobile'
categories: react nodejs
---

When developing applications locally, we typically access them through a local server using the address "localhost." However, there are instances where we need to test our applications on different devices. While deploying the application is an option, it's not always practical for frequent testing. What if you could access your application directly without deploying it? This can be achieved by accessing the development server from another device.

## Prerequisites

Ensure that all devices are connected to the same network. To access the development server from other devices, they must be on the same network as your computer, whether it's a Wi-Fi or wired connection.

## Step 1 - Obtain Your Computer's IP Address

First, find out the local IP address of the machine running your application.

On `Windows`, open _Powershell_ or _Command Prompt_ and type the below command:

```bash
ipconfig
```

Look for the IPv4 address associated with your network interface (e.g., eth0 or wlan0).

On `Mac/Linux`, open the _Terminal_ and type the below command:

```bash
ifconfig
```

Look for the entry corresponding to your active network connection (e.g., en0 for Ethernet or en1 for Wi-Fi), and you'll find your IP address listed next to "inet".

## Step 2 - Starting the Vite Dev Server

Assuming your React application is created using Vite, when you start the Vite dev server with `npm run dev`, it binds to `localhost` only. To allow access from other devices, start the application using the `--host` option and specify your computer's IP address.

Open `package.json` in your React application's root directory and change the script from `"dev": "vite"` to `"dev": "vite --host"`.

After making the changes, your package.json script should look like below:

```json
"scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
}
```

Alternatively, you can also start the server by running the below command:

```bash
npm run dev -- --host
```

## Step 3 - Accessing the Vite Dev Server From Another Device

With the Vite dev server running and bound to the `--host` option, you can now access it from another device. Open a browser on your mobile or any other device and type the following URL:

{:.blockquote}

> http://\<COMPUTER_IP_ADDRESS\>:\<DEV_SERVER_PORT_NUMBER\>

Replace `<COMPUTER_IP_ADDRESS>` with your Ip address which you found in Step 1 and `<DEV_SERVER_PORT_NUMBER>` with the port number you vite server is running.

Example: `http://192.168.1.170:5173`

## Step 4 - Setting Up CORS in the Backend

While you can now access the frontend React app from another device, interacting with the backend application might pose a challenge. If you're using Node.js and Express for your backend, you need to set up `CORS` to allow access from other IP addresses.

Navigate to your backend application and install CORS:

```bash
npm install cors
```

Add the following code to your application's index file:

```javascript
import cors from 'cors';

app.use(cors());
```

This allows incoming requests from any network. If you want to limit requests to certain networks, add the below code:

```javascript
const allowedOrigins = ['http://localhost:5173', 'http://192.168.1.170:5173'];
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);
```

Now run your backend server using the command specified in your `package.json` file.

{:.blockquote}

> NOTE: For a Node.js backend server, there's no need to provide a host option to start the server.

You can now access the application from different devices and send requests to the backend server.

## Conclusion

Accessing the local development server from other devices on the same network provides a convenient way to test applications without the need for frequent deployments. By following the steps outlined above, you can easily access your application from various devices and ensure its functionality across different platforms. Additionally, setting up CORS in the backend enables seamless communication between frontend and backend components, allowing for comprehensive testing and development.
