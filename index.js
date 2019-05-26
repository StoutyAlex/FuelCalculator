const AWS = require('aws-sdk');
const getFuelCost = require('./src/getFuelCost');

exports.handler = async (event, context, callback) => {

  const s3 = new AWS.S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });

  const fuelPrices = await getFuelCost();

  s3.putObject({
    Bucket: 'int-fuel-cost',
    Key: 'costs.json',
    Body: JSON.stringify(fuelPrices, null, 2),
  }, (err, data) => {
    if (err) {
      console.log('Error', err);
      callback(null, { success: false });
    } else {
      console.log('Success', data);
      callback(null, { success: true });
    }
  })

  callback(null, { success: true });
  console.log('end of func');
};