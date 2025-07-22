before starting developing
a project setup is done before to avoid some problems during devlopement phase,

-in the project setup part,things i get to know about are

-.gitkeep file - used to track empty folders

-dev dependencies - dependencies used only during development phase.

-prettier -this helps avoid conflicts when working in a team, configure basic format. 

-mongo db uri ending slash can create problems so remove slash\

-use try/catch and async await while connecting to database

-give proper error name, so it is easier to debug later and save some time.

-async fn technically returns a promise.

-configure cors and cookie-parser

-mongoose middleware (pre)

-our own methods can be created by using schemaName.methods.methodName,

-jwt is a bearer token(key, anyone can use your key if you lost it)

-access token and refresh token

-configured cloudinary for uploading files (handled both cases a successful upload and failed to upload)

-used node fileSystem(read more)

-configured multer to store files temporarily on the server before uploading it on the cloudinary,this gives us the local file path, which will be used to upload the file in cloudinary and then the same will be used to unlink

-70% of the setup is done