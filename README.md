<p align="center">
    <img align="center" src="https://f.mwhitney.dev/icons/project-one-64.png">
    <br>
    <h1 align="center">Project O.N.E. - Server</h1>
</p>
<p align="center">
    The Node.JS communications backend for Project O.N.E.
    <br><br>
    <a target="_blank" href="https://github.com/mwhitney57/Project-O.N.E."><img src="https://img.shields.io/badge/Project%20O.N.E.-3D556B?style=flat&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAFVBMVEUAAAArO0rA6+s0SVw5T2M9VWv///8cYhYEAAAAAXRSTlMAQObYZgAAAFBJREFUGNOFj0EKwEAMAnU0//9yDy3bZXuoOQhDEJV8a3OwSYMBy9iEtgR7AaYESzIOhRlKJJl8QJnnmgOQv48tdIYV6g8wocNb7Kh+jjvnXykdAi0mh4iNAAAAAElFTkSuQmCC" alt="A Project O.N.E. Subproject"></a>
    <img src="https://img.shields.io/badge/designed for-windows-blue?style=flat&logo=windows" alt="Designed for and Tested on Windows">
    <img src="https://img.shields.io/badge/version-0.9.0-blue" alt="Server v0.9.0">
    <img src="https://img.shields.io/badge/language-Node.JS-5FA04E?logo=node.js" alt="Written in Node.JS">
    <a target="_blank" href="https://github.com/mwhitney57/Project-O.N.E.-System/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL%203.0-yellow" alt="GPL License v3.0"></a>
</p>

### Table of Contents
- [Description](https://github.com/mwhitney57/Project-O.N.E.-Server?tab=readme-ov-file#-description)
- [Features](https://github.com/mwhitney57/Project-O.N.E.-Server?tab=readme-ov-file#-features)
- [Additional Information](https://github.com/mwhitney57/Project-O.N.E.-Server?tab=readme-ov-file#%E2%84%B9%EF%B8%8F-additional-information)

### 📃 Description
This application is a part of  __Project O.N.E.__

The communications server for <a target="_blank" href="https://github.com/mwhitney57/Project-O.N.E.">Project O.N.E.</a>
The server acts as a communications proxy between the <a target="_blank" href="https://github.com/mwhitney57/Project-O.N.E.-System">Project O.N.E. System</a> and any connected standard clients.
One example of a standard client is the <a target="_blank" href="https://github.com/mwhitney57/Project-O.N.E.-Controller">Project O.N.E. Controller</a>, a Java app for easily sending commands to the system.

Despite being another subproject to develop and maintain, the server is ideal so that the system does not need to be exposed.
This also opens up the possibility of having multiple systems in the future. Clients would connect to a specific system on the server.

### ✨ Features
- Handles communication between the <a target="_blank" href="https://github.com/mwhitney57/Project-O.N.E.-System">Project O.N.E. System</a> and any standard clients, such as the <a target="_blank" href="https://github.com/mwhitney57/Project-O.N.E.-Controller">Project O.N.E. Controller</a>.
- Authenticated access only, using SHA256 hashing.
- Supports full remote control of core system features.
- [Planned] Support for log retrieval, two-way audio communication, and more.

### ℹ️ Additional Information
The server authenticates connection attempts from the system and standard clients via tokens.
When a connection attempt is made with a token, that token is encrypted and compared to those stored on the server.
The encrypted tokens for comparison are pulled from the process environment variables `TOKEN_SYSTEM` and `TOKEN_CLIENT` at runtime.
Connection attempts that lack a necessary authentication token, or contain one with an invalid value, are rejected.
