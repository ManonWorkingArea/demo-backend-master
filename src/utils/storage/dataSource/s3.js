import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsCommand,HeadObjectCommand } from '@aws-sdk/client-s3';

export function s3() {

    const bucket= "global-config"
    // Initialize the S3 client
    const s3 = new S3Client({
    endpoint: "https://sgp1.digitaloceanspaces.com",
    region: "ap-southeast-1",
    responseContentEncoding: 'utf-8',
    credentials: {
    accessKeyId: "DO002ZQ7YJEENMPYUYWT",
    secretAccessKey: "LbZeQ5T66umfoKupnpZgoNcM/JPULinJmajrlXNflHM",
    },
    s3BucketEndpoint: true,
    bucketEndpoint: true,
    bucketPrefix: 'cache/',
    });

  async function set(key, value) {
    // Convert the value to a string
    const valueString = JSON.stringify(value);
    const prefixedKey = `cache/` + key;
    // Upload the value to S3
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: prefixedKey,
      Body: valueString,
    }));
  }

  async function get(key) {
    // Download the value from S3
    const prefixedKey = `cache/` + key;
    const response = await s3.send(new GetObjectCommand({
      Bucket: bucket,
      Key: prefixedKey,
    }));
  
    // Get a reader for the stream
    const reader = response.Body.getReader();
  
    // Read the data from the stream
    const { value } = await reader.read();
  
    // Convert the value to a string
    let valueString = new TextDecoder().decode(value);
    try {
      // Try to parse the value as JSON
      //console.log("S3",valueString);
      return valueString;
    } catch (error) {
      // If the value is not in a valid JSON format, return it as is
      return valueString;
    }
  }
  
  
  async function remove(key) {
    // Delete the value from S3
    const prefixedKey = `cache/` + key;
    await s3.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: prefixedKey,
    }));
  }

  async function clear(key) {
    // Delete all values from S3
    const params = {
      Bucket: bucket,
    };
    let objects;
    let response;
    do {
      response = await s3.send(new ListObjectsCommand(params));
      objects = response.Contents;
      const deletePromises = objects.map(() => {
        //const key = object.Key;
        const prefixedKey = `cache/` + key;
        console.log("delete",key)
        return s3.send(new DeleteObjectCommand({
          Bucket: bucket,
          Key: prefixedKey,
        }));
      });
      await Promise.all(deletePromises);
      params.ContinuationToken = response.NextContinuationToken;
    } while (response.IsTruncated);
  }
  

  async function getAll() {
    // Download all values from S3
    const params = {
      Bucket: bucket,
    };
    let objects;
    const data = {};
    let response;
    do {
      response = await s3.send(new ListObjectsCommand(params));
      objects = response.Contents;
      for (const object of objects) {
        const key = object.Key;
        const prefixedKey = `cache/` + key;
        const valueResponse = await s3.send(new GetObjectCommand({
          Bucket: bucket,
          Key: prefixedKey,
        }));
        const value = JSON.parse(valueResponse.Body.toString());
        data[key] = value;
      }
      params.ContinuationToken = response.NextContinuationToken;
    } while (response.IsTruncated);
    return data;
  }
  

  async function has(key) {
    try {
        const prefixedKey = `cache/` + key;
      await s3.send(new HeadObjectCommand({
        Bucket: bucket,
        Key: prefixedKey,
      }));
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }
    
      return { set, get, remove, clear, getAll, has };
    }
