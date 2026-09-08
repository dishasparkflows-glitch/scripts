const { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://922fd6304f87348d80a8e12fe0a729de.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '4bd18bce6abe64780ec92c118b971e5e',
    secretAccessKey: '80685f4cb4ca0b69e1bfc0409968014edc1de910c232c91267eec0f3d5c30e80',
  },
});

async function runTest() {
  const testKey = `Neirah_Jewellers/admin/test/test-${Date.now()}.txt`;
  console.log('Uploading test object to key:', testKey);
  
  await s3Client.send(new PutObjectCommand({
    Bucket: 'telecrm',
    Key: testKey,
    Body: Buffer.from('Hello R2! Test connection successful.'),
    ContentType: 'text/plain',
  }));
  console.log('Upload successful!');

  console.log('Verifying with HeadObject...');
  const headRes = await s3Client.send(new HeadObjectCommand({
    Bucket: 'telecrm',
    Key: testKey,
  }));
  console.log('HeadObject successful! ContentLength:', headRes.ContentLength);

  console.log('Deleting test object...');
  await s3Client.send(new DeleteObjectCommand({
    Bucket: 'telecrm',
    Key: testKey,
  }));
  console.log('Delete successful! R2 connection verified.');
}

runTest().catch(err => {
  console.error('R2 test failed:', err);
  process.exit(1);
});
