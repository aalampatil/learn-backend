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

-route 

in app.js - declare routes
app.use("api/v1/users",userRouter) //when user route hits,this pass on the control to userRouter then,
//http://localhost:8000.api/vi/users

in user.router.js - router
router.route("/register").post(registerUser) // userRouter moves to registe which calls the registerUser controller 
//http://localhost:8000.api/vi/users/register - user registered

-multer mistake i did, upload.fields([({},{})]) , it is ([{},{}])

-Multer gives you [req.files] as an object only when using [upload.fields()], and the field names must match exactly.

- return res
    .status(201) //this 
    .json(
      new ApiResponse(
        201, // this should match, ig the new update,diff codw word the reponse you will get is incorrect, so use same code
        createdUser,
        "user registered successfully",
      )
    );
});

-CLOUDINARY RESPONSE AFTER SUCCESSFULL UPLOADS
{
  asset_id: '702b95843f4f6a2c464ed687e4db3e8c',
  public_id: 'ahwq0iq2ejmbvfucewrm',
  version: 1753380271,
  version_id: '975fdb944dda6d1f4b62043d9c081133',
  signature: 'd8d0296deafad69a9d903ba7da4be26ffdaa7d32',
  width: 7360,
  height: 4912,
  format: 'jpg',
  resource_type: 'image',
  created_at: '2025-07-24T18:04:31Z',
  tags: [],
  bytes: 2067232,
  type: 'upload',
  etag: '8894e5bf4b6cafc8184420eddddedac5',
  placeholder: false,
  url: 'http://res.cloudinary.com/dgvo6ulfd/image/upload/v1753380271/ahwq0iq2ejmbvfucewrm.jpg',
  secure_url: 'https://res.cloudinary.com/dgvo6ulfd/image/upload/v1753380271/ahwq0iq2ejmbvfucewrm.jpg',
  asset_folder: '',
  display_name: 'ahwq0iq2ejmbvfucewrm',
  original_filename: 'pexels-kqpho-1583582',
  api_key: '923837282266661'
}

- use same name for collection and environmnet ib postman
-when sending form data use multer,only multer can parse form data while using postman
-only json data can be passed on without multer