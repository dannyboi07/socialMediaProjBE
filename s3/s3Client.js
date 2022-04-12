const { S3Client, ListBucketsCommand, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

const region = "ap-south-1";
const credentials = { 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY 
};

const s3Client = new S3Client({ credentials, region });

function uploadProfImg(file) {
    const fileReadStream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket: "social-media-proj-bucket-1",
        Key: `public/profile-pics/${file.filename}`,
        Body: fileReadStream
    };

    return s3Client.send(new PutObjectCommand(uploadParams));
}

function uploadFile(file) {
    const fileReadStream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket: "social-media-proj-bucket-1",
        Key: `public/post-images/${file.filename}`,
        Body: fileReadStream
    };

    return s3Client.send(new PutObjectCommand(uploadParams));
};

function getS3Obj(Key) {
    console.log(Key);
    const getParams = {
        Bucket: "social-media-proj-bucket-1",
        Key
    };

    return s3Client.send(new GetObjectCommand(getParams))
}

module.exports = { 
    s3Client,
    ListBucketsCommand,
    GetObjectCommand,
    uploadFile,
    uploadProfImg,
    getS3Obj
 };