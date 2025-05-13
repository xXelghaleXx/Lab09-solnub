const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const config = require('../config/storage');

const s3 = new AWS.S3({
  region: config.aws.region,
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
});

const bucketName = config.aws.bucket;

function uploadToS3(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Key: `${Date.now()}_${path.basename(file.originalname)}`,
    Body: fileStream,
    ContentType: file.mimetype,
  };

  return s3.upload(uploadParams).promise();
}

function deleteFromS3(key) {
  return s3.deleteObject({ Bucket: bucketName, Key: key }).promise();
}

module.exports = { uploadToS3, deleteFromS3 };
