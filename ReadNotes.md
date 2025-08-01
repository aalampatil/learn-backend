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
  original_filename: '',
  api_key: ''
}

- use same name for collection and environmnet ib postman
-when sending form data use multer,only multer can parse form data while using postman
-only json data can be passed on without multer

*** mongodb findOne $or ***
-either pass only one varibale, because or can result in error
Why undefined or empty values break it
In MongoDB:
{ username: undefined } doesn't mean "do nothing" — it can match documents missing the field or with null values.
If your $or clause has one condition that is always true (like an empty object {}), then any user could match.
This is why user1@user.com ends up matching a completely different user, like user1@email.com.

*** better use one findOne({email}) or findOne({username}) // it can be used but as of now i am getting error ***

*** missing await can cause misleading error, add await when making calls to db and where the req can take time ***

*** check what are you accessing using (.) and from where you are accessing, like req.body or req.user ***

-cloudinary response when uploaded a video file,
{
  asset_id: 'c626b6ab8ed8a841a353953214088475',
  public_id: 'kpentks3yf1fjsgrp7qi',
  version: 1753869614,
  version_id: '8e42c90a5b7909a31ba38b333f763345',
  signature: 'ad38635b5132032fc4ac445d148cf5b7c9e084e8',
  width: 2160,
  height: 3840,
  format: 'mp4',
  resource_type: 'video',
  created_at: '2025-07-30T10:00:14Z',
  tags: [],
  pages: 0,
  bytes: 54684101,
  type: 'upload',
  etag: '354ec656a43201fb7e6a96588647b7c2',
  placeholder: false,
  url: 'http://res.cloudinary.com/dgvo6ulfd/video/upload/v1753869614/kpentks3yf1fjsgrp7qi.mp4',
  secure_url: 'https://res.cloudinary.com/dgvo6ulfd/video/upload/v1753869614/kpentks3yf1fjsgrp7qi.mp4',
  playback_url: 'https://res.cloudinary.com/dgvo6ulfd/video/upload/sp_auto/v1753869614/kpentks3yf1fjsgrp7qi.m3u8',
  asset_folder: '',
  display_name: 'kpentks3yf1fjsgrp7qi',
  audio: {},
  video: {
    pix_format: 'yuv420p',
    codec: 'h264',
    level: 52,
    profile: 'High',
    bit_rate: '18892935',
    dar: '9:16',
    time_base: '1/15360'
  },
  frame_rate: 60,
  bit_rate: 18897313,
  duration: 23.15,
  rotation: 0,
  original_filename: '14110589_2160_3840_60fps',
  api_key: '923837282266661'
}


***************************************************************************
| Type            | Example URL                | How to access in Express |
| --------------- | -------------------------- | ------------------------ |
| **Route param** | `/videos/6889...`          | `req.params.videoId`     |
| **Query param** | `/videos/?videoId=6889...` | `req.query.videoId`      |

router.route("/:videoId).get(getVideoById) = GET /videos/****6889efa2fb88ac3cf50bd95e*** this part is /:videoId a dynamicId which wasted my 3 hrs

***************************************************************************

-getAllVideos controller can be enhanced by adding count of video, null check for videos, index and cahing ? will read more about this

-Subscriber Count of a channel = Find all the document of that channel(basically a user) created and count 

-Subscribed to Channels = find all the documents of a subscriber(obviously a user) with different channels