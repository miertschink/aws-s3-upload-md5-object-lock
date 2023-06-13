import * as crypto from "crypto";
import {PassThrough, Readable} from "stream";
import {createReadStream} from 'fs';
import {Upload} from "@aws-sdk/lib-storage";
import {S3Client} from "@aws-sdk/client-s3";

const s3Client = new S3Client({region: 'eu-central-1'});

const uploadResult = await uploadFile(
    createReadStream('testFile.txt')
);

console.warn(uploadResult.$metadata.httpStatusCode);

if (uploadResult.$metadata.httpStatusCode !== 200) {
    console.warn(JSON.stringify(uploadResult));
}

// data can be any kind of stream
// like from PDFKit or so
async function uploadFile(data: Readable) {
    try {
        // create a "copy" of the stream
        const copyOfDataStream = new PassThrough();
        data.pipe(copyOfDataStream);

        const md5Hash = await calculateMd5Hash(data);

        const upload = new Upload({
            params: {
                Body: copyOfDataStream,
                Bucket: 'your-bucket-name',
                Key: 'your-file-key',
                ContentMD5: md5Hash,
            },
            client: s3Client,
        });

        return await upload.done();
    } catch (error) {
        throw error;
    }
}

// this function calculates the md5 hash of a stream
// it's wrapped in a promise so it can be awaited to ensure the whole file is processed
async function calculateMd5Hash(stream: Readable): Promise<string> {

    const hash = crypto.createHash('md5');

    return new Promise((resolve, reject) => {
        stream.on('error', (error: Error) => reject(error));
        // this is the important part where the hash is calculated
        // it needs to be updated for each chunk of data
        stream.on('readable', function () {
            const data = stream.read();
            if (data !== null) {
                hash.update(data);
            }
        });
        stream.on('end', () => {
            const digest = hash.digest('base64');
            resolve(digest);
        });
    });
}
