require('dotenv').config();

module.exports = {
  provider: 'aws',
  aws: {
    region: process.env.AWS_REGION,
    bucket: process.env.S3_BUCKET_NAME,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
};
