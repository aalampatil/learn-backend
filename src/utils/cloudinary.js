import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //uploading
        const uploadResponse =  await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto",
        })
        //file uploaded successfully
        //console.log("responseFromCloudinary", responseFromCloudinary);
        //console.log("file uploaded on cloudinary",responseFromCloudinary.url);
        fs.unlinkSync(localFilePath)
        return uploadResponse;      
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved file as the upload operation got failed
        console.log("upload on cloudinary failed", error);      
        return null
    }
}


const deleteFromCloudinary = async (public_id) => {
    //console.log(public_id);
    
  try {
    if (!public_id) {
      throw new Error("Missing public_id for Cloudinary deletion");
    }

    const result = await cloudinary.uploader.destroy(`${public_id}`, {
      resource_type: "image", 
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Cloudinary deletion failed: ${result.result}`);
    }
    
    //console.log(result);
    
    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error.message);
    throw error;
  }
};



export {uploadOnCloudinary, deleteFromCloudinary}