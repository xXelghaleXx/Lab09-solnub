// s3.js
const AWS = require('aws-sdk');
const { S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const s3 = new AWS.S3();

async function uploadFileToS3(file) {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: Date.now() + '-' + file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype
    // ACL: 'public-read' ❌ ELIMINADO
  };

  return s3.upload(params).promise(); // Devuelve una promesa
}

async function deleteFileFromS3(filename) {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: filename
  };

  return s3.deleteObject(params).promise();
}

module.exports = {
  uploadFileToS3,
  deleteFileFromS3
};
